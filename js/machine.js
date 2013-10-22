function Machine(loadAddress) {
	this.env = new Environment();

	this.instrCount = 0; // в скомпилированных командах
	this.instrNo = 0; // Какая по счету выполняется инструкция в текущей подпрограмме
	this.subprogIndex = 0;
	this.program = null; // откомпилированная (из compiler.js) программа
	this.subprogs = null; // просто ссылка на this.program.subprograms

	this.loadProgram = function (program) {
	    this.program = program;
	    this.subprogs = this.program.subprograms;
	    var th = this;
	    program.subprograms.forEach(function (subprog, i, arr) {
	        subprog.bytecode.forEach(function (byte, i, sp) { th.env.memory[subprog.offset + i] = byte; });
	        th.instrCount += subprog.bytecode.length;
	    });
	    this.instrCount /= 4;

	    for (var i = 0; i < 256; ++i) {
	        if (program.gregInitValues[i] !== undefined)
	            this.env.registers["$" + i] = new Multibyte(8, "#" + program.gregInitValues[i].toString(16));
	        else
	            this.env.registers["$" + i] = new Multibyte(8, "#0");
	        //this.env.registers["$" + i] =
            //    new Multibyte(8, "#" + (program.nm_types[i] == NM_REG ? program.initRegisters[i]: 0));
		}
	}

	this.compileLoadProgram = function(str_program) {
	    var program = compileProgram(str_program);	    
	    this.loadProgram(program);
	}

	this.runProgram = function() {
		for (var i = 0; i < this.instrCount; ++i) {
		    this.execNextInstr();
		}
	}

	this.execNextInstr = function () {
        // если все подпрограммы закончились
	    if (this.subprogIndex >= this.subprogs.length)
	        return;
	    // если в текущей подпрограмме больше нет инструкции, переходим к следующей
	    if (this.instrNo >= this.subprogs[this.subprogIndex].bytecode.length / 4) {
	        //console.log("Switching to next subprogram");
	        this.subprogIndex++;
	        this.instrNo = 0;
	    }

        // считываем текущую инструкцию
	    var off = this.subprogs[this.subprogIndex].offset + this.instrNo * 4;
	    //console.log("Command offset: " + off);
	    var currentCmd = this.env.memory.slice(off, off + 4);
	    console.log("Executing: " + currentCmd);
        
	    var instruction = mmixInstrSet[currentCmd[0]];
	    if (instruction !== undefined)
	        mmixInstrSet[currentCmd[0]].runFunction(this, currentCmd);
	    else
	        throw "Invalid opcode `" + currentCmd[0] + "`";

	    this.instrNo++;
	}

	// debug functionality
	this.reset = function() {
		this.prevEnv = null;
		this.progSize = 0;
		this.cmdOffset = 0;
		this.env = new Environment();
	}
}

