/* 
   Превращагет аргумент в цепочку байт
   namespace - из program.namespace
   arg - строковое значение аргумента
   Возвращает массив
 */
function reduceExprArg(namespace) {
    return function (arg) {
        if (typeof arg == 'string' && arg[0] == '$') {
            return parseInt(arg.substring(1));
        } else if (typeof arg == 'number') {
            return (parseInt(arg));
        } else if (arg[0] == "\"" && arg[arg.length - 1] == "\"") {
            return arg.substring(1, arg.length - 1).split('').map(ord);
        } else if (regexCheckNumber(arg)) {
            if (arg[0] == '#')
                return new Multibyte(8, arg).bytes;
            else
                return intToBytes(parseInt(arg));
        } else if (namespace[arg] !== undefined) {
            return reduceExprArg(namespace)(namespace[arg]);
        } else
            return [];
    };
}

/* Принимает текст программы. возвращает программу в формате, который нарисован у меня на окне */
function parseProgram(program) {
	return { lines: program.split("\n").map(parseLine) };
}

/* Тут должна быть самопяльная арифметика с поддержкой +#ff3 и т.п. */
/* Функция для частичного применения. 
   Возвращает для программы функцию, вычисляющую численное значение строкового выражения strValue
*/
function calcConstantValue(program) {
	return function(strValue) {
		if (regexCheckRegister(strValue)) {
			return parseInt(strValue.substring(1));	
		}
		var replaced = strValue.replace(/(\d*[a-z]+\d*)/g, function(s) { return program.namespace[s]; }); // для выражений, использующих псевдонимы из пространства имен		

		return eval(replaced);
	};
}

/* 
  Записывает в пространство имен программы (program.namespace) численные эквиваленты, 
  определяемые макросами IS, GREG
*/
var NM_NONREG = 0;
var NM_REG = 1;
function fillMacroAliases(program) {
	var localGregCounter = 255;
	if (!program.namespace) 
	    program.namespace = {};
	if (!program.gregInitValues)
	    program.gregInitValues = {};
	program.lines.filter(function(line) { return line.operand == "IS" || line.operand == "GREG"; }).forEach(
		function(line, i, ISLines) {
		    if (line.operand == "IS") {
		        program.namespace[line.label] = calcConstantValue(program)(line.expr[0]);
		    } else {
		        console.log("Greg for " + line.label + "; Setting program.gregInitValues[" + localGregCounter + "] to " + calcConstantValue(program)(line.expr[0]));
		        program.namespace[line.label] = localGregCounter;
		        program.gregInitValues[localGregCounter] = calcConstantValue(program)(line.expr[0]);
		        localGregCounter--;
		    }
		}
	);
}

/*
  Записывает в program.lines[i].byteCount размер инструкции, в которую 
  скомпилируется строка program.lines[i]
  Размеры инструкций нужны для вычисления их адресов, занесения этих адресов в пространство имен.
*/
function calcCommandSizes(program) {
	program.lines.forEach(function(line, i, lines) {
		var sizeFunc = mmixInstrSet[line.operand].size;
		var commandSize = sizeFunc ? sizeFunc(line.expr, program.namespace) : 0;
		line.byteCount = commandSize;
	});
}

/* 
  Обрабатывает макросы LOC, создает program.subprogams, содержащий 
     индексы строчек начала и конца цельного куска кода в памяти
  Заносит численные эквиваленты меток инструкций в program.namespace
*/
function collectLabels(program) {
	if (!program.namespace)
		program.namespace = {};
	var instrPointer = 0;
	var subprogStart = 0,
		subprogOffset = 0;
	program.subprograms = [];

	function pushNewSubprogram(_offset, _lineFrom, _lineTo) {
		var subprogram = {
			offset: _offset,
			lineFrom: _lineFrom,
			lineTo: _lineTo
		};
		program.subprograms.push(subprogram);
		return subprogram;
	}

	function replaceSelfReferences(line) {
		for (var i = 0; i < line.expr.length; ++i) {
			line.expr[i] = line.expr[i].replace(/@/g, instrPointer);
		}
	}

	program.lines.forEach(function(line, i, lines) {
		if (line.operand == "IS" || line.operand == "GREG") {
		} else if (line.operand == "LOC") {
			/*var locAddr = parseNumber(line.expr);*/
			/* по-хорошему, тут должна быть закомментированная строчка */
			var locAddr = parseInt(line.expr);
			pushNewSubprogram(subprogOffset, subprogStart, i);
			instrPointer = subprogOffset = locAddr;
			subprogStart = i;	
			replaceSelfReferences(line);	
		} else {			
			if (line.label) 
				program.namespace[line.label] = instrPointer;
			replaceSelfReferences(line);
			instrPointer += mmixInstrSet[line.operand].size(line.expr, program.namespace);
		}
	});

	pushNewSubprogram(subprogOffset, subprogStart, program.lines.length);
}

/* 
  Преобразует аргументы и регистры в числа
*/
function replaceAliases(program) {
	program.lines.forEach(function(line, i, lines) {
		line.expr = line.expr.map(calcConstantValue(program)); // частичное применение функции
	});
}

/*
  Ассемблирует программу. Возвращает массив таких структур:
  {offset:int, bytecode:[byte]} - потом его нужно будет загружать в MMIX-машину
*/
function assembleProgram(program) {
    function generateInstruction(line) {
        if (isMacro(line.operand))
            return [];
	    var instrDescriptor = mmixInstrSet[line.operand];
		var asm = instrDescriptor.asmFunction(line.expr.map(reduceExprArg(program.namespace)));
		//console.log("Assembled line " + line.expr + ": " + asm);
		return asm;
	}

	return program.subprograms.map(function(subprog) {
		var mmixSubprog = {
			offset: subprog.offset,
			bytecode: []
		};
		for (var l = subprog.lineFrom; l < subprog.lineTo; ++l) {
			mmixSubprog.bytecode = mmixSubprog.bytecode.concat(generateInstruction(program.lines[l]));
		}
		return mmixSubprog;
	});
}

function mlog(str, val) {
	console.log(str);
	console.log(val);
}

/*
  Компиляция программы в байткод
  prog - строчка, разные строки разделены посредством \n
  Возвращает массив объектов-подпрограмм:
    .offset - место в памяти, с которого начинать загрузку подпрограммы
    .bytecode - массив байт, загружаемых в память
*/
function compileProgram(prog) {
	var program = parseProgram(prog);
	fillMacroAliases(program);
	calcCommandSizes(program);
	collectLabels(program);
	program.subprograms = assembleProgram(program);
	return program;
}

/* DEBUG PART */

var tp1 =
"var1 IS 5\n\
var2 IS 6\n\
var3 IS (var1+var2)*2\n\
firstadd ADD $1,$2,$3\n\
LOC 5\n\
secadd ADD $0,$7,$8\n\
thiadd ADD $9,$10,$11";

var tp2 =
"l IS 500\n\
a GREG 8\n\
b GREG 9\n\
ADD $0,a,b";

function test() {
    var prog = compileProgram(tp1);
    mmixMachine.loadProgram(prog);
    mmixMachine.runProgram();
}

function test2() {
    mmixMachine.compileLoadProgram(tp2);
    mmixMachine.runProgram();
}
