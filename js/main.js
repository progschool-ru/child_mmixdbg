var mmixMachine = new Machine();

function createMMIXView() {
	var mtable_code = "<table border=1>";
	for (var i = 0; i < mmixMachine.env.MEMORY_SIZE; ++i) {
		mtable_code += "<tr>";
		mtable_code += "<td>#" + (i).toString(16) + "</td>";
		mtable_code += "<td id=\"mmix_mem" + i + "\">#" + mmixMachine.env.memory[i].toString(16) + "</td>";
		mtable_code += "</tr>";
	}
	mtable_code += "</table>";

	var rtable_code = "<table border=1>";
	for (var i = 0; i < 255; ++i) {
		rtable_code += "<tr>";
		rtable_code += "<td>$" + i + "</td>";
		rtable_code += "<td id=\"mmix_reg" + i + "\">" + mmixMachine.env.readRegister("$" + i).toString() + "</td>";
		rtable_code += "</tr>";
	}
	rtable_code += "</table>";
	
	document.getElementById("mmix_mem").innerHTML = mtable_code;
	document.getElementById("mmix_reg").innerHTML = rtable_code;
}

function updateViews() {
	for (var i = 0; i < mmixMachine.env.MEMORY_SIZE; ++i) {
		document.getElementById("mmix_mem" + i).innerHTML = "#" + mmixMachine.env.memory[i].toString(16);
	}

	for (var i = 0; i < 255; ++i) {
		document.getElementById("mmix_reg" + i).innerHTML = mmixMachine.env.readRegister("$" + i).toString();
	}
	console.log("Views is up-to-date");
}

function runCode(code) {
/*	var assembled = assembleCode(code);
	mmixMachine.loadProgram(assembled, 0);
	mmixMachine.runProgram();*/
	var compiled = compileCode(code);
	console.log("Successfully compiled program. Bytecode: ");
	console.log(compiled.bytecode);
	mmixMachine.loadProgram(compiled);
	console.log("Program loaded. Updating view");
	mmixMachine.runProgram();

	updateViews();
}
