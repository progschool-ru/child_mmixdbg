var mmixMachine = new Machine();

function createMMIXView() {
	var mtable_code = "<table border=1>";
	for (var i = 0; i < mmixMachine.env.MEMORY_SIZE; ++i) {
		mtable_code += "<tr>";
		mtable_code += "<td>#" + i.toString(16) + "</td>";
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
	
	document.getElementById("mem_div").innerHTML = mtable_code;
	document.getElementById("reg_div").innerHTML = rtable_code;
}

function updateViews() {
	for (var i = 0; i < mmixMachine.env.MEMORY_SIZE; ++i) {
		document.getElementById("mmix_mem" + i).innerHTML = "#" + mmixMachine.env.memory[i].toString(16);
	}

	for (var i = 0; i < 255; ++i) {
		document.getElementById("mmix_reg" + i).innerHTML = mmixMachine.env.readRegister("$" + i).toString();
	}
}

function runCode(code) {
	var assembled = assembleCode(code);
	mmixMachine.loadProgram(assembled, 0);
	mmixMachine.runProgram();
	updateViews();
}
