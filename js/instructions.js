var mmixInstrSet = []; // можно обращаться как через имя инструкции в 
                       // верхнем регистре, так и через опкод(если есть (для BYTE нету))
/* все функции run* работают в контексте ммикс-машины */

var OPCODE_LOC = -1, 
	OPCODE_IS = -2,
	OPCODE_GREG = -3;

function parseExprArg(arg) {
	if (arg[0] == '$') 
		return parseInt(arg.substring(1));
	else if (arg[0] == '#')
		return parseInt(arg.substring(1), 16);
	else if (/^\d+$/.test(arg))
		return parseInt(arg);
	else {
		//throw "Undefined behaviour for EXPR argument";
		makeSyntaxError("Undefined behaviour for EXPR argument", arg, -123);
	}
}

function xyzTemplate(instrOpcode) {
	return function(expr) {
		return [
			instrOpcode,
			parseExprArg(expr[0]),
			parseExprArg(expr[1]),
			parseExprArg(expr[2])
		];
	}
}

// добавляет представление функции 
function describeInstruction(_asciiName, _opcode, _runFunction) {
	mmixInstrSet[_opcode] = mmixInstrSet[_asciiName] = {
		opcode: _opcode,
		asciiName: _asciiName,
		asmFunction: xyzTemplate(_opcode),
		runFunction: _runFunction
	};
}

// для РОН
function intToReg(rootEnv, registerNo) {
	return rootEnv.readRegister("$" + registerNo.toString());
}

// context - MMIX-мащины
function runAdd(context, commandBytes) {
	var regResult = intToReg(context.env, commandBytes[1]),
		regA = intToReg(context.env, commandBytes[2]),
		regB = intToReg(context.env, commandBytes[3]);

	regResult.add(regA).add(regB);
}

function LdWrapper(bytesize) {
	return function(context, commandBytes) {
		var x = intToReg(context.env, commandBytes[1]),
			y = intToReg(context.env, commandBytes[2]),
			z = intToReg(context.env, commandBytes[3]);
		var temp_sum = new Multibyte(8, null);
		temp_sum.add(y).add(z);
		x.set(context.env.readMemoryMultibyte(bytesize, temp_sum));
	};
}

// на самом деле bytesize - количество байт в мультибайте
function StWrapper(bytesize) {
	return function(context, commandBytes) {
		var x = multibyteCast(bytesize, intToReg(context.env, commandBytes[1])),
			y = intToReg(context.env, commandBytes[2]),
			z = intToReg(context.env, commandBytes[3]);
		var temp_sum = new Multibyte(8, null);
		temp_sum.add(y).add(z);
		context.env.writeMemoryMultibyte(x, temp_sum);
	};
}

function runStco(context, commandBytes) {
	var y = intToReg(context.env, commandBytes[2]),
		z = intToReg(context.env, commandBytes[3]);
	var temp_sum = new Multibyte(8, null);
	temp_sum.add(y).add(z);
	context.env.writeMemoryMultibyte(new Multibyte(1, '#' + commandBytes[1].toString(16)), temp_sum);
}

// ТУТ ОПИСЫВАТЬ ПРАВИЛА АССЕМБЛИРОВАНИЯ И ЗАПУСКА ИНСТРУКЦИЙ

/* BYTE - особая инструкция */
mmixInstrSet["BYTE"] = {
		opcode: -1,
		asciiName: "BYTE",
		asmFunction: function (expr) {
			var bytes = new Array(expr.length);
			for (var i in expr) {
				bytes[i] = expr[i] & 0xff;
			}
			return bytes;
		},
		runFunction: function() {}
	};

describeInstruction("ADD", 0x20, runAdd);

describeInstruction("LDB", 0x80, LdWrapper(1));
describeInstruction("LDT", 0x81, LdWrapper(4));
describeInstruction("LDW", 0x84, LdWrapper(2));
describeInstruction("LDO", 0x85, LdWrapper(8));

describeInstruction("STB", 0xa0, StWrapper(1));
describeInstruction("STT", 0xa1, StWrapper(4));
describeInstruction("STW", 0xa4, StWrapper(2));
describeInstruction("STO", 0xa5, StWrapper(8));

describeInstruction("STCO", 0xb4, runStco);

// ассемблирует строку кода
// OLD SHIT
/*function (line, program) {
	var parsed = parseLine(line);
	console.log("parsed.label is `" + (parsed.label) + "`");
	if (parsed.label != null) {
		console.log("program.namespace is ");
		console.log(program.namespace["a"]);
		program.namespace[parsed.label] = program.offset + program.commandCounter * COMMAND_SIZE;
	}

	return mmixInstrSet[parsed.operand].asmFunction(parsed.expr);
}*/

function assembleLine(parsedLine) {
	return mmixInstrSet[parsedLine.operand].asmFunction(parsedLine.expr);
}

function nextInstrAddr(program) {
	return program.offset + program.commandCounter * COMMAND_SIZE;
}

/*
	Прекомпиляция строчки:
	1) Обрабатываются макросы LOC, IS, GREG
	2) Записываются в program.namespace адреса всех меток
 */
function precompileLine(line, program, lineNr) {
	var parsed = parseLine(line);
	var macroArgMultibyte = null;
	var oper = parsed.operand;

	program.namespace[lineNr] = nextInstrAddr(program);
	if (isMacro(oper)) {
		macroArgMultibyte = new Multibyte(4, parsed.expr[0]);		
		program.namespace[lineNr] += COMMAND_SIZE; // для макроса @ означает адрес следующей инструкции
	}

	if (oper == "LOC") { // макрос
		if (program.commandCounter != 0) 
			makeSyntaxError("LOC macro is too late!", line, -123);
		program.offset = macroArgMultibyte.toInteger();
	} else if (oper == "IS") {
		program.namespace[parsed.label] = parsed.expr[0];		
	} else if (oper == "GREG") { // макрос
		program.namespace[parsed.label] = "$" + program.gregCounter.toString();
		program.initRegisters[program.gregCounter] = macroArgMultibyte.toInteger();
		program.gregCounter--;		
	} else { // обычная команда
		//program.code = program.code.concat(assembleLine(line, program));
		var parsed = parseLine(line);
		if (parsed.label != null) {
			program.namespace[parsed.label] = program.offset + program.commandCounter * COMMAND_SIZE;
		}
		program.code = program.code.concat(line);
		program.commandCounter++;
	}
}

/*
   Прекомпиляция кода = прекомпиляция всех строк
   Код на этом этапе не ассемблируется
 */
function precompileCode(code) {
//	var program = [];
	var program = { 
		code: [], // Строковое представление
		bytecode: [],
		offset: 0,
		commandCounter: 0,
		gregCounter: 254, // следующий претендент на GREG
		initRegisters: [], // только для РОН
		namespace: [] // сопоставление метка->адрес
	};
	for (var i = 0; i < 256; ++i)
		program.initRegisters[i] = 0;
		            
	var lines = code.split("\n");
	for (var lineIndex in lines) {
		//console.log("Precompiling line:" + lines[lineIndex]);
		var line = lines[lineIndex];
		if (/^\s*$/.test(line))
			continue;

		/*
		 * program = nextLine(line, program) - если в nextLine нельзя менять program напрямую
		 * nextLine(line, program) - если можно
		 */
		//program = program.concat(assembleLine(line));
		precompileLine(line, program, lineIndex);
	}

	return program;
}

/* Заменяет метки их численнымии эквивалентами */
function reduceLine(line, namespace, lineNr) {
	var parsed = parseLine(line);
	for (var i = 0; i < parsed.expr.length; ++i) {
		if (/^[a-zA-Z]{1}\w*$/.test(parsed.expr[i])) { // значит текущий аргумент нужно брать из пространства имен
			if (namespace[parsed.expr[i]] === undefined) {
				//throw "reduceLine -> can't parse" + parsed.expr[i];
				makeSemanticError("Undefined namespace element " + parsed.expr[i], line, -123);
			} else
				parsed.expr[i] = namespace[parsed.expr[i]];
		} else if (parsed.expr[i] == "@") {
			parsed.expr[i] = namespace[lineNr];
		}
	}

	return parsed;
}


function postcompileCode(program) {
	for (var instrIndex in program.code) { 
		var instr = program.code[instrIndex];
		program.bytecode = program.bytecode.concat(assembleLine(reduceLine(instr, program.namespace, instrIndex)));
	}
	
	return program;
}

// Обертка для precompile и postcompile
function compileCode(code) {
	return postcompileCode(precompileCode(code));
}
