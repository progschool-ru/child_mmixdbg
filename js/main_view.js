var mmixMachine = new Machine();

/* В одной ячейке - один байт */
var VIEW_MEM_WIDTH = 16,
	VIEW_MEM_HEIGHT = 24;

function createMMIXmemView() {
	var mtable_code = 
		"<table border=0>\
			<tr><td></td>";

	mtable_code += "<td class=separatorCell></td>"
	// шапка таблицы - 00..ff
	for (var i = 0; i < VIEW_MEM_WIDTH; ++i) {
		if (i == 8) {
			mtable_code += "<td class=\"separatorCell\"></td>";
		}
		mtable_code += "<td><b>";
		mtable_code += i.toString(16).addLeadingZeros(2);
		mtable_code += "</b></td>";
	}
	mtable_code += "</tr>";

	for (var i = 0; i < VIEW_MEM_HEIGHT; ++i) {
		mtable_code += "<tr>";
		mtable_code += "<td><b>#" + (i * 16).toString(16).addLeadingZeros(16) + "</b></td>";
		mtable_code += "<td class=\"separatorCell\"></td>";
		for (var j = 0; j < VIEW_MEM_WIDTH; ++j) {
			if (j == 8) {
				mtable_code += "<td></td>";
			}
			var addr = i * VIEW_MEM_WIDTH + j;
			mtable_code += "<td id=\"mmix_mem\"" + addr + ">" + mmixMachine.env.memory[addr].toString(16).addLeadingZeros(2) + "</td>";
		}
		mtable_code += "</tr>";
	}

	document.getElementById("mmix_mem").innerHTML = mtable_code;
}

function createMMIXregView() {

}

function createMMIXView() {
	createMMIXmemView();
	createMMIXregView();

	var rtable_code = "<table border=1>";
	for (var i = 0; i < 255; ++i) {
		rtable_code += "<tr>";
		rtable_code += "<td>$" + i + "</td>";
		rtable_code += "<td id=\"mmix_reg" + i + "\">" + mmixMachine.env.readRegister("$" + i).toString() + "</td>";
		rtable_code += "</tr>";
	}
	rtable_code += "</table>";
	
	
	document.getElementById("mmix_reg").innerHTML = rtable_code;
}

function updateViews() {
	/*for (var i = 0; i < mmixMachine.env.MEMORY_SIZE; ++i) {
		document.getElementById("mmix_mem" + i).innerHTML = "#" + mmixMachine.env.memory[i].toString(16);
	}*/
	//document.getElementById("mmix_mem").innerHTML = mtable_code;
	createMMIXmemView();

	for (var i = 0; i < 255; ++i) {
		document.getElementById("mmix_reg" + i).innerHTML = mmixMachine.env.readRegister("$" + i).toString();
	}
	console.log("Views is up-to-date");
}

function resetMachine() {
	mmixMachine.reset();
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
