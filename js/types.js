function Multibyte(size, stringValue) {
	this.size = size;
	this.bytes = [];

	this.full = function() {
		for (var i = 0; i < this.
	}

	this.clean = function() {
		for (var i = 0; i < this.size; ++i)
			this.bytes[i] = 0;
	}

	this.clean();
	
	this.add = function(anotherMultibyte) {
		if (anotherMultibyte.size == this.size) {
			for (var i = 0; i < this.size; ++i)  // складываем
				this.bytes[i] += anotherMultibyte.bytes[i];
			for (var i = size; i >= 1; --i) { // переносим кроме самого старшего байта
				var overflow = 0xff - this.bytes[i];
				if (overflow > 0) 
					this.bytes[i - 1] += overflow;						
			}

			if (this.bytes[0] > 0xff) {
				var overflow = 0xff - this.bytes[0];
				this.clean();
				this.bytes[this.size - 1] = overflow;
			}

			return this;
		} else
			throw "Different multibyte sizes: " + anotherMultibyte.size + " and " + this.size;
		return null;
	}

	this.toString = function() {
		var result = "#";
		for (var i = 0; i < this.size; ++i) {
			result += this.bytes[i].toString(16);
		}
	}

	this.parseFromString = function(stringValue) {
		var raw = stringValue.substring(1);
		if (raw.length % 2 == 0) {
			var bytesCount = raw.length / 2;
			if (bytesCount != this.size) 
				throw "Multibyte size mismatch";
			
			for (var i = 0; i < bytesCount; ++i) {
				var currentByte = raw.substring(i * 2, (i + 1) * 2);
				this.bytes[i] = parseInt(currentByte, 16);
			}

			return this;
		} else
			throw "Multibyte length is not even";
	}

	this.set = function(anotherOctabyte) {
		if (anotherOctabyte.size == this.size) {
			this.bytes = anotherOctabyte.bytes;
		} else
			throw "Size mismatch";
	}

	if (stringValue != null) {
		this.parseFromString(stringValue);
	}
}

function Octabyte(stringValue) {
}
