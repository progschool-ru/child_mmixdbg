function Environment() {
	this.COMMON_REGISTER_COUNT = 256;
	this.SPECIAL_REGISTER_COUNT = 32;
	var registers = [];
	for (var i = 0; i < this.COMMON_REGISTER_COUNT; ++i) 
		registers["$" + i] = new Multibyte(8, null);
	for (var i = ord('A'); i <= ord('Z'); ++i)
		registers["r" + chr(i)] = new Multibyte(8, null);
	registers["rBB"] = new Multibyte(8, null);
	registers["rTT"] = new Multibyte(8, null);
	registers["rWW"] = new Multibyte(8, null);

	this.readRegister = function(registerName) {
		var reg = registers[registerName];
		if (reg === undefined) 
			throw "Bad register name";

		return reg;
	}

	this.writeRegister = function(registerName, value) {
		if (registers[registerName] === undefined)
			throw "Bad register name";

		registers[registerName].set(value);

		return registers[registerName];
	}

	this.MEMORY_SIZE = 8192; // байт
	this.memory = new Array(this.MEMORY_SIZE);
}
