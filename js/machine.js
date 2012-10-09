function Machine(loadAddress) {
	this.env = new Environment();

	this.instructionAss = [];
	this.labels = [];
	this.codeStart = this.env.MEMORY_SIZE + 1;
	this.progSize = 0;

	this.loadProgram = function(program, offset) {
		this.codeStart = Math.min(offset, this.codeStart);
		if (program.length % 4 != 0)
			throw "Invalid program size! Not even-even!";
		this.progSize = program.length / 4;
		for (var i = 0; i < program.length; ++i) {
			this.env.memory[this.codeStart + i] = program[i];
		}
	}

	this.runProgram = function() {
		for (var i = 0; i < this.progSize; ++i) {
			var currentCmd = this.env.memory.slice(this.codeStart + i * 4, this.codeStart + (i + 1) * 4);
			console.log("mmixinstrset : ");
			console.log(mmixInstrSet);
			mmixInstrSet[currentCmd[0]].runFunction(this, currentCmd);
		}
	}
}

var my = new Machine();
my.env.writeRegister("$1", "#4");
my.env.writeRegister("$2", "#2");
