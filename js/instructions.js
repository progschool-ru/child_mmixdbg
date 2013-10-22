var mmixInstrSet = []; // можно обращаться как через имя инструкции в 
                       // верхнем регистре, так и через опкод(если есть (для BYTE нету))

function xyzTemplate(instrOpcode) {
	return function(expr) {
	/*	return [
			instrOpcode,
			parseExprArg(expr[0]),
			parseExprArg(expr[1]),
			parseExprArg(expr[2])
		];*/
		// return [
		// 	instrOpcode
		// ].concat(parseExprArg(expr[0])).concat(parseExprArg(expr[1])).concat(parseExprArg(expr[2]));
		return [instrOpcode, expr[0], expr[1], expr[2]];
	}
}

/* Описывает инструкцию 
   asciiName - 'ADD', 'SUB', 'IS', ..
   opcode - #20, #...
   sizeFunction(expr:[String], namespace:Map String->Int) - размер инструкции в байтах
   asmFunction(expr:[String], namespace:Map String->Int) - преобразует инструкцию в [Byte]
   runFunction(context:Machine, commandBytes:[Byte]) - как должна работать в контексте MMIX-машины
   macroFunction(program:Program, expr:[String]) - поведение макроса
 */
function describeInstr(_asciiName, _opcode, _sizeFunction, _asmFunction, _runFunction, _macroFunction) {
	mmixInstrSet[_opcode] = mmixInstrSet[_asciiName] = {
		opcode: _opcode,
		size: _sizeFunction,
		asciiName: _asciiName,
		asmFunction: _asmFunction,
		runFunction: _runFunction,
		macroFunction: _macroFunction
	};
}

// добавляет представление обыкновенной инструкции в 4 байта 
function describeCommonInstr(_asciiName, _opcode, _runFunction) {
	describeInstr(_asciiName, _opcode, function(expr, namespace) { return 4; }, xyzTemplate(_opcode), _runFunction);
}

// для РОН
function readRegisterNo(rootEnv, registerNo) {
	return rootEnv.readRegister("$" + registerNo.toString());
}

/* все функции run* работают в контексте ммикс-машины */
// context - MMIX-мащины
function runAdd(context, commandBytes) {
    console.log("Adding! Arguments = " + commandBytes[1] + ", " + commandBytes[2] + ", " + commandBytes[3]);
	var regResult = readRegisterNo(context.env, commandBytes[1]),
		regA = readRegisterNo(context.env, commandBytes[2]),
		regB = readRegisterNo(context.env, commandBytes[3]);

	regResult.add(regA).add(regB);
	console.log("Resulting reg: " + regResult.toString());
}

function LdWrapper(bytesize) {
	return function(context, commandBytes) {
		var x = readRegisterNo(context.env, commandBytes[1]),
			y = readRegisterNo(context.env, commandBytes[2]),
			z = readRegisterNo(context.env, commandBytes[3]);
		var temp_sum = new Multibyte(8, null);
		temp_sum.add(y).add(z);
		x.set(context.env.readMemoryMultibyte(bytesize, temp_sum));
	};
}

// на самом деле bytesize - количество байт в мультибайте
function StWrapper(bytesize) {
	return function(context, commandBytes) {
		var x = multibyteCast(bytesize, readRegisterNo(context.env, commandBytes[1])),
			y = readRegisterNo(context.env, commandBytes[2]),
			z = readRegisterNo(context.env, commandBytes[3]);
		var temp_sum = new Multibyte(8, null);
		temp_sum.add(y).add(z);
		context.env.writeMemoryMultibyte(x, temp_sum);
	};
}

function runStco(context, commandBytes) {
	var y = readRegisterNo(context.env, commandBytes[2]),
		z = readRegisterNo(context.env, commandBytes[3]);
	var temp_sum = new Multibyte(8, null);
	temp_sum.add(y).add(z);
	context.env.writeMemoryMultibyte(new Multibyte(1, '#' + commandBytes[1].toString(16)), temp_sum);
}

mmixInstrSet["IS"] = mmixInstrSet["GREG"] = mmixInstrSet["LOC"] = {
	opcode: -1,
	asciiName: "IS",
	size: function(expr, namespace) { return 0; },
	asmFunction: function(expr) { return []; },
	runFunction: null,
	macroFunction: null
}
mmixInstrSet["GREG"].asciiName = "GREG";
mmixInstrSet["LOC"].asciiName = "LOC";

/* BYTE - особая инструкция */
mmixInstrSet["BYTE"] = {
	opcode: -1,
	asciiName: "BYTE",
	size: function(expr, namespace) {
		return flatten(expr.map(function(e) { return reduceExprArg(namespace, e); } )).length;
	},
	asmFunction: function(expr) {
		return flatten(expr.map(function(e) { return reduceExprArg(namespace, e); }));
	},
	runFunction: function() {},
	macroFunction: function() {}
}

describeCommonInstr("ADD", 0x20, runAdd);

describeCommonInstr("LDB", 0x80, LdWrapper(1));
describeCommonInstr("LDT", 0x81, LdWrapper(4));
describeCommonInstr("LDW", 0x84, LdWrapper(2));
describeCommonInstr("LDO", 0x85, LdWrapper(8));

describeCommonInstr("STB", 0xa0, StWrapper(1));
describeCommonInstr("STT", 0xa1, StWrapper(4));
describeCommonInstr("STW", 0xa4, StWrapper(2));
describeCommonInstr("STO", 0xa5, StWrapper(8));

describeCommonInstr("STCO", 0xb4, runStco);
