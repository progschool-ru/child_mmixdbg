function Multibyte(sizeN, stringValue) { // суперкласс всех октабайтов, тетрабайтов итд
	this.size = sizeN; // размер в байтах
	this.bytes = [];

	this.full = function() { // this = 0xfff...ff?
		for (var i = 0; i < this.size; ++i)
			if (this.bytes[i] != 0xff)
				return false;
		return true;
	}

	this.clean = function() { // выставляет значения всех байтов в ноль
		for (var i = 0; i < this.size; ++i)
			this.bytes[i] = 0;
		return this;
	}

	this.clean();
	
	this.add = function(anotherMultibyte) { // прибавляет по месту другой мультибайт, возвращает себя
		if (anotherMultibyte.size == this.size) { // проверка на соответствие размером 
			for (var i = 0; i < this.size; ++i)  // складываем без переноса
				this.bytes[i] += anotherMultibyte.bytes[i];
			for (var i = this.size; i >= 1; --i) { // переносим кроме самого старшего байта
				var overflow = this.bytes[i] - 0xff;
				if (overflow > 0) { 
					console.log("overflow");
					this.bytes[i - 1] += overflow;						
				}
			}

			if (this.bytes[0] > 0xff) { // если самый старший байт переполнен, то выставляем все число = переполнение
				var overflow = this.bytes[0] - 0xff;
				this.clean();
				this.bytes[this.size - 1] = overflow;
			}

			return this;
		} else
			throw "Different multibyte sizes: " + anotherMultibyte.size + " and " + this.size;
	}

	this.toString = function() {
		var result = "#";
		for (var i = 0; i < this.size; ++i) {
			var hexByte = this.bytes[i].toString(16);
			if (hexByte.length < 2)
				hexByte = "0" + hexByte;
			result += hexByte;
		}
		return result;
	}

	this.parseFromString = function(stringValue) { // парсит мультибайт из строки формата #11ffbb23
		var raw = stringValue.substring(1);
		if (true) {
			var bytesCount = Math.floor(raw.length / 2) + raw.length % 2;
			if (raw.length % 2 == 1)
				raw = "0" + raw;
			for (var i = 0; i < bytesCount; ++i) {
				var currentByte = raw.substring(i * 2, (i + 1) * 2);
				this.bytes[this.size - bytesCount + i] = parseInt(currentByte, 16);
			}

			return this;
		} else
			throw "Multibyte length is not even";
	}

	this.set = function(anotherOctabyte) {
		console.log("setting octabyte; type = " + typeof anotherOctabyte);
		if (typeof anotherOctabyte == "string") {
			console.log("here");
			this.parseFromString(anotherOctabyte);
		} else if (typeof anotherOctabyte == "number") {
			throw "not implemented yet"; // stub
		} else if (typeof anotherOctabyte == "object") {
			if (anotherOctabyte.size == this.size) {
				this.bytes = anotherOctabyte.bytes;
			} else
				throw "Size mismatch";
		}
	}

	if (stringValue != null) { // конструктор размазало
		this.parseFromString(stringValue);
	}
}
