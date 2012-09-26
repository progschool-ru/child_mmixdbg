function Octabyte(stringHexVal) {
	this.lTetra = this.hTetra = 0; // low and high tetrabytes

	this.parseOctabyte = function (hexValue) {
		console.log("Parsing new octabyte from `" + hexValue + "`");
		var rawValue = hexValue.substring(1);
		var zerosNeed = 16 - rawValue.length;
		for (var i = 0; i < zerosNeed; ++i) 
			rawValue = "0" + rawValue;
		console.log("Raw value is `" + rawValue + "`");
		this.lTetra = parseInt(rawValue.substring(8), 16);
		this.hTetra = parseInt(rawValue.substring(0, 8), 16);
		console.log("lTetra is " + this.lTetra + "; hTetra is " + this.hTetra);
	}

	if (stringHexVal != null) {
		if (stringHexVal[0] == '#') {
			this.parseOctabyte(stringHexVal);
		} else
			throw "Non-hexademical numbers are not supported yet";
	} else {
		//stub
	}

	this.toString = function() {
		if (this.hTetra > 0)
			return "#" + this.hTetra.toString(16) + this.lTetra.toString(16);
		else
			return "#" + this.lTetra.toString(16);
	}

	this.set = function(anotherOctabyte) {
		if (typeof(anotherOctabyte) == "string") { // по дефолту - hex число
			this.parseOctabyte(anotherOctabyte);
		} else if (typeof(anotherOctabyte) == "object") {
			this.lTetra = anotherOctabyte.lTetra;
			this.hTetra = anotherOctabyte.hTetra;
		} else
			throw "Unrecognized octabyte format";
	}
}
