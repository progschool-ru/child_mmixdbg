function Octabyte(stringHexVal) {
	this.lTetra = this.hTetra = 0; // low and high tetrabytes

	function parseOctabyte(hexValue) {
		this.lTetra = parseInt(stringHexVal.substring(9)),
		this.hTetra = parseInt(stringHexVal.substring(1, 9));
	}

	if (stringHexVal[0] == '#') {
		parseOctabyte(stringHexVal);
	} else if (stringHexVal != null)
		throw "Non-hexademical numbers are not supported yet";

	this.toString = function() {
		return "#" + this.hTetra.toString(16) + this.lTetra.toString(16);
	}

	this.set = function(anotherOctabyte) {
		if (typeof(anotherOctabyte) == "string") {
			parseOctabyte(anotherOctabyte);
		} else if (typeof() == "object") {
			this.lTetra = anotherOctabyte.lTetra;
			this.hTetra = anotherOctabyte.hTetra;
		} else
			throw "Unrecognized octabyte format";
	}
}
