// ТРЭШАК! ВЫКИНУТЬ!
function Assembler() {
	this.counter = 0; // счетчик команд

	this.nextInstruction = function() {
		this.counter++; 
	}

	this.eatLine = function(line) {
		this.nextInstruction(); // передвигаем всякие счетчики инструкций
		var parsedLine = parseLine(line);
		var workingFunc = mmixInstrSet[parsedLine.operand];
		if (workingFunc === undefined)  // есть ли реализация инструкции
			throw "`" + parsedLine.operand + "` not implemented yet";

		if (this.labels[parsedLine.label] === undefined) { // биндим метку
			this.labels[parsedLine.label] = this.counter;
		} else
			throw "`" + parsedLine.label + "` already exists";

		workingFunc(this, parsedLine.expr); // вызываем инструкцию
	}
}
