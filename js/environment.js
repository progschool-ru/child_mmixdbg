function Environment() {
	this.COMMON_REGISTER_COUNT = 256;
	this.SPECIAL_REGISTER_COUNT = 32;
	var registers = [];
	for (var i = 0; i < COMMON_REGISTER_COUNT; ++i) 
		registers["$" + i] = Octabyte(null);	
	for (var i = ord('A'); i <= ord('Z'); ++i)
		registers["r" + chr(i)] = Octabyte(null);
	registers["rBB"] = Octabyte(null);
	registers["rTT"] = Ocatbyte(null);
	registers["rWW"] = Octabyte(null);

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
	}

	this.MEMORY_SIZE = 8192; // байт
	this.memory = new Array(MEMORY_SIZE);
}
