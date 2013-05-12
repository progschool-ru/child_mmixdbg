function Environment() {
	this.COMMON_REGISTER_COUNT = 256;
	this.SPECIAL_REGISTER_COUNT = 32;
	this.registers = [];
	for (var i = 0; i < this.COMMON_REGISTER_COUNT; ++i) 
		this.registers["$" + i] = new Multibyte(8, null);
	for (var i = ord('A'); i <= ord('Z'); ++i)
		this.registers["r" + chr(i)] = new Multibyte(8, null);
	this.registers["rBB"] = new Multibyte(8, null);
	this.registers["rTT"] = new Multibyte(8, null);
	this.registers["rWW"] = new Multibyte(8, null);
	this.prevMem = null;

	this.readRegister = function(registerName) {
		var reg = this.registers[registerName];
		if (reg === undefined) 
			throw "Bad register name";

		return reg;
	}

	this.writeRegister = function(registerName, value) {
		if (this.registers[registerName] === undefined)
			throw "Bad register name";

		this.registers[registerName].set(value);

		return this.registers[registerName];
	}

	this.MEMORY_SIZE = 4096; // байт
	this.memory = new Array(this.MEMORY_SIZE);
	for (var i = 0; i < this.MEMORY_SIZE; ++i)
		this.memory[i] = 0;

	this.getRealAddr = function(multibyteAddr) {
		/*return multibyteAddr.bytes[0] + 
			   multibyteAddr.bytes[1] >> 8 + 
			   multibyteAddr.bytes[2] >> 16 + 
			   multibyteAddr.bytes[3] >> 24;*/
		return multibyteAddr.toInteger();
	}

	this.writeMemoryMultibyte = function(multibyte, addr) {
		var real_addr = this.getRealAddr(addr);
		/*if (!(ireal_addr > 0 && ireal_addr + multibyte.size < this.MEMORY_SIZE))
			throw "Bad multibyte write space";*/
		for (var i = 0; i < multibyte.size; ++i) {
			this.memory[real_addr + i] = multibyte.bytes[i];
		}
	}

	this.readMemoryMultibyte = function(size, addr) {
		var real_addr = this.getRealAddr(addr);
		var res = new Multibyte(size, null);
		for (var i = 0; i < size; ++i) {
			res.bytes[i] = this.memory[real_addr + i];
		}
		return res;
	}

	/*
	 * XORs prevMem and memory; returns XOR result
	 * if result[i] == 0 -> i'th memory cell is not changed
	 */
	this.calcMemChanges = function() {
		var memChg = new Array(this.MEMORY_SIZE);
		for (var i = 0; i < this.MEMORY_SIZE; ++i) {
			memChg[i] = this.memory[i] ^ this.prevMem[i];
		}
		return memChg;
	}

	/*
	 * Saves current memory state 
	 */
	this.backupMem = function() {
		this.prevMem = replicateArray(this.memory);
	}

	this.backupMem();
}
