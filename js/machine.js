function Machine(loadAddress) {
	this.env = new Environment();
	this.prevEnv = null;

//	this.codeStart = this.env.MEMORY_SIZE + 1;
	this.progSize = 0; // в скомпилированных командах
	this.cmdOffset = 0;

	this.loadProgram = function(program) {
//		this.codeStart = Math.min(offset, this.codeStart);
		//if (program.bytecode.length % 4 != 0)
		//	throw "Invalid program size! Length modulo 4 not equals 0!";
		this.progSize = program.bytecode.length / 4;
		this.codeStart = program.offset;
		for (var i = 0; i < program.bytecode.length; ++i) {
			console.log("loading to address " + (program.offset + i));
			this.env.memory[program.offset + i] = program.bytecode[i];
		}
		
		for (var i = 0; i < 255; ++i) {
			this.env.registers["$" + i] = new Multibyte(8, "#" + program.initRegisters[i].toString());
		}
		console.log(this.env);
	}

	this.runProgram = function() {
		console.log("Running program");
		for (var i = 0; i < this.progSize; ++i) {
				this.oscillatorTick();	
		}
	}

	this.oscillatorTick = function() {
		if (this.cmdOffset > this.progSize) {
			return;
		}
		var currentCmd = this.env.memory.slice(this.codeStart + this.cmdOffset * 4, this.codeStart + (this.cmdOffset + 1) * 4);
		var instruction = mmixInstrSet[currentCmd[0]];
		console.log("instruction:");
		console.log(instruction);
		if (instruction !== undefined)		
			mmixInstrSet[currentCmd[0]].runFunction(this, currentCmd);
		else
			throw "Invalid opcode `" + currentCmd[0];

		this.cmdOffset++;
	}

	this.backupEnv = function() {
		this.prevEnv = this.env;
	}

	// debug functionality
	this.reset = function() {
		this.prevEnv = null;
		this.progSize = 0;
		this.cmdOffset = 0;
		this.env = new Environment();
	}
}

