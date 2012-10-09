var mmixInstrSet = []; // можно обращаться как через имя инструкции в 
                       // верхнем регистре, так и через опкод
/* все функции run* работают в контексте ммикс-машины */

function parseCommandTetra(tetrabyte) {
	var result = { 
		opcode: (tetrabyte && 0xff000000) >> 24,
		x: (tetrabyte && 0xff0000) >> 16,
		y: (tetrabyte && 0xff00) >> 8,
		z: (tetrabyte && 0xff)
	};

	return result;
}

function parseExprArg(arg) {
	if (arg[0] == '$') 
		return parseInt(arg.substring(1));
	else
		throw "Undefined behaviour for EXPR argument";
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

function joinCommand(splittedCommand) {
	return
		(splittedCommand.opcode << 24) + 
		(splittedCommand.x << 16) + 
		(splittedCommand.y << 8) + 
		(splittedCommand.z);
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

// ТУТ ОПИСЫВАТЬ ПРАВИЛА АССЕМБЛИРОВАНИЯ И ЗАПУСКА ИНСТРУКЦИЙ
describeInstruction("ADD", 0x20, runAdd);

// ассемблирует строку кода
function assembleLine(line) {
	var parsed = parseLine(line);

	return result = mmixInstrSet[parsed.operand].asmFunction(parsed.expr);
}

function assembleCode(code) {
	var program = [];
	var lines = code.split("\n");
	for (var lineIndex in lines) {
		var line = lines[lineIndex];
		program = program.concat(assembleLine(line));
	}

	return program;
}

