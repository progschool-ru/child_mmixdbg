/* 
   Превращагет аргумент в цепочку байт
   arg - строчка
   Возвращает массив
 */
function reduceExprArg(arg, namespace) {
	if (typeof arg == 'number') {
		return intToBytes(parseInt(arg));
	} else if (arg[0] == "\"" && arg[arg.length - 1] == "\"") {
		return arg.substring(1, arg.length - 1).split('').map(ord);
	} else if (regexCheckNumber(arg)) {
		if (arg[0] == '#') 
			return new Multibyte(8, arg).bytes;
		else
			return intToBytes(parseInt(arg));
	} else if (namespace[arg] !== undefined) {
		return reduceExprArg(namespace[arg], namespace);
	} else
		return [];
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
function fillMacroAliases(program) {
	var localGregCounter = 255;
	if (!program.namespace) 
		program.namespace = {};
	program.lines.filter(function(line) { return line.operand == "IS" || line.operand == "GREG"; }).forEach(
		function(line, i, ISLines) {
			if (line.operand == "IS")
				program.namespace[line.label] = calcConstantValue(program)(line.expr[0]);
			else
				program.namespace[line.label] = localGregCounter--;
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
		var instrDescriptor = mmixInstrSet[line.operand];
		return instrDescriptor.asmFunction(line.expr);
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

var testProgram = 
"var1 IS 5\n\
var2 IS 6\n\
var3 IS (var1+var2)*2\n\
firstadd ADD $1,$2,$3\n\
LOC 5\n\
secadd ADD $0,$7,$8\n\
thiadd ADD $9,$10,$11";

function tmp() {
	function mlog(str, val) {
		console.log(str);
		console.log(val);
	}
	var program = parseProgram(testProgram);
	fillMacroAliases(program);
	mlog('Macro filled: ', program);
	calcCommandSizes(program);
	mlog('Command sizes calculated: ', program);
	collectLabels(program);
	mlog('Labels collected: ', program);
	replaceAliases(program);
	mlog('Aliases replaced: ', program);
	var subprograms = assembleProgram(program);
	mlog('Program assembled: ', subprograms);
}
