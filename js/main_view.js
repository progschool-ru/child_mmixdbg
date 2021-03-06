var mmixMachine = new Machine();

/* В одной ячейке - один байт */
var VIEW_MEM_WIDTH = 16,
	VIEW_MEM_HEIGHT = 24;

function createMMIXmemView() {
	var mtable_code = 
		"<table>\
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

	var changes = null;
	if (mmixMachine.env.prevMem) {
		changes = mmixMachine.env.calcMemChanges();
	}

	for (var i = 0; i < VIEW_MEM_HEIGHT; ++i) {
		mtable_code += "<tr>";
		mtable_code += "<td><b>#" + (i * 16).toString(16).addLeadingZeros(16) + "</b></td>";
		mtable_code += "<td class=\"separatorCell\"></td>";
		for (var j = 0; j < VIEW_MEM_WIDTH; ++j) {
			if (j == 8) {
				mtable_code += "<td></td>";
			}
			var addr = i * VIEW_MEM_WIDTH + j;

			var byteStrVal = mmixMachine.env.memory[addr].toString(16).addLeadingZeros(2);
			if (!changes)
				mtable_code += "<td id=\"mmix_mem" + addr + "\">" + byteStrVal + "</td>";
			else if (changes[addr] == 0)
				mtable_code += "<td id=\"mmix_mem" + addr + "\">" + byteStrVal + "</td>";
			else if (changes[addr] != 0)
				mtable_code += "<td id=\"mmix_mem" + addr + "\"><span class=changed>" + byteStrVal + "</span></td>"  
		}
		mtable_code += "</tr>";
	}

	mmixMachine.env.backupMem();

	document.getElementById("mmix_mem").innerHTML = mtable_code;
}

function createMMIXregView() {

}

function createMMIXView() {
	createMMIXmemView();
	createMMIXregView();

	var rtable_code = "<table>";
	for (var i = 0; i < 256; ++i) {
		rtable_code += "<tr>";
		rtable_code += "<td><b>$" + i + "</b></td>";
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
}

function resetMachine() {
	mmixMachine.reset();
}

function runCode(code) {
/*	var assembled = assembleCode(code);
	mmixMachine.loadProgram(assembled, 0);
	mmixMachine.runProgram();*/
	resetMachine();
	var compiled = compileProgram(code);
	console.log("Program compiled");
	mmixMachine.loadProgram(compiled);
	console.log("Program loaded to machine");
	mmixMachine.runProgram();
	console.log("Run successful");

	updateViews();
}

function buttonMouseOver(buttonId) {
	document.getElementById(buttonId).className = "toolbutton_mover";
}

function buttonMouseOut(buttonId) {
	document.getElementById(buttonId).className = "toolbutton";
}
