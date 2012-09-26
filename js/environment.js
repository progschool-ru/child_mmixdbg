function Environment() {
	this.COMMON_REGISTER_COUNT = 256;
	this.SPECIAL_REGISTER_COUNT = 32;
	var registers = [];
	for (var i = 0; i < this.COMMON_REGISTER_COUNT; ++i) 
		registers["$" + i] = new Octabyte(null);	
	for (var i = ord('A'); i <= ord('Z'); ++i)
		registers["r" + chr(i)] = new Octabyte(null);
	registers["rBB"] = new Octabyte(null);
	registers["rTT"] = new Octabyte(null);
	registers["rWW"] = new Octabyte(null);

	this.readRegister = function(registerName) {
		var reg = registers[registerName];
		if (reg === undefined) 
			throw "Bad register name";

		return reg;
	}

	this.writeRegister = function(registerName, value) {
		if (registers[registerName] === undefined)
			throw "Bad register name";

		registers[registerName] = new Octabyte(value);

		return registers[registerName];
	}

	this.MEMORY_SIZE = 8192; // байт
	this.memory = new Array(this.MEMORY_SIZE);
}
