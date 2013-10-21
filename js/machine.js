function Machine(loadAddress) {
	this.env = new Environment();

//	this.codeStart = this.env.MEMORY_SIZE + 1;
	this.progSize = 0; // в скомпилированных командах
	this.cmdOffset = 0;
	this.offsets = null; // массив чисел - смещений подпрограмм в памяти

	this.loadProgram = function (program) {
	    this.program = program;
	    var th = this;
	    program.subprograms.forEach(function (subprog, i, arr) {
	        subprog.bytecode.forEach(function (byte, i, sp) { th.env.memory[subprog.offset + i] = byte; });
	    });

	    for (var i = 0; i < 255; ++i) {	        
	        this.env.registers["$" + i] =
                new Multibyte(8, "#" + (program.nm_types[i] == NM_REG ? program.initRegisters[i].toString() : 0));
		}
	}

	this.program = null;

	this.compileLoadProgram = function(str_program) {
	    var program = compileProgram(str_program);	    
	    this.loadProgram(program);
	}

	this.runProgram = function() {
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
		if (instruction !== undefined)		
			mmixInstrSet[currentCmd[0]].runFunction(this, currentCmd);
		else
			throw "Invalid opcode `" + currentCmd[0];

		this.cmdOffset++;
	}

	// debug functionality
	this.reset = function() {
		this.prevEnv = null;
		this.progSize = 0;
		this.cmdOffset = 0;
		this.env = new Environment();
	}
}

