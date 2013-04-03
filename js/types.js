/*
  Класс Multibyte
  Реализует длинную арифметику для MMIX
  Является суперклассом октабайта, тетрабайта, вайда и байта
*/
function Multibyte(sizeN, stringValue) { // суперкласс всех октабайтов, тетрабайтов итд
	this.size = sizeN; // размер в байтах
	this.bytes = []; // одна ячейка - один байт
					 // this.bytes[0] - старший байт
					 // this.bytes[this.bytes.length - 1] - младший байт

	this.full = function() { // this == 0xfff...ff
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
					this.bytes[i - 1] += overflow;						
				}
			}

			if (this.bytes[0] > 0xff) { // если самый старший байт переполнен, то выставляем все число = переполнение
				var overflow = this.bytes[0] - 0xff;
				this.clean();
				this.bytes[this.size - 1] = overflow;
			}

			return this;
		} else {
			throw "Different multibyte sizes: " + anotherMultibyte.size + " and " + this.size;

		}
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

	this.toInteger = function() {
		return parseInt(this.toString().substring(1), 16);
	}

	this.parseFromString = function(stringValue) { // парсит мультибайт из строки формата #11ffbb23
		if (stringValue[0] != '#') {
			if (/\d+/.test(stringValue)) {
				var intVal = parseInt(stringValue);
				console.log("multibyte from str-int: " + intVal);
				this.bytes[this.bytes.length - 1] = intVal & 0xff;
				this.bytes[this.bytes.length - 2] = (intVal >> 8) & 0xff;
				this.bytes[this.bytes.length - 3] = (intVal >> 16) & 0xff;
				this.bytes[this.bytes.length - 4] = (intVal >> 24) & 0xff;				
			} else 
				throw "Non-hexademical multibyte format";
		} else {
			var raw = stringValue.substring(1);
			var bytesCount = Math.floor(raw.length / 2) + raw.length % 2;
			if (raw.length % 2 == 1)
				raw = "0" + raw;
			for (var i = 0; i < bytesCount; ++i) {
				var currentByte = raw.substring(i * 2, (i + 1) * 2);
				this.bytes[this.size - bytesCount + i] = parseInt(currentByte, 16);
			}

			return this;
		} //else
			// throw "Multibyte length is not even";
	}

	this.set = function(anotherOctabyte) {
		if (typeof anotherOctabyte == "string") {
			this.parseFromString(anotherOctabyte);
		} else if (typeof anotherOctabyte == "number") {
			throw "not implemented yet"; // stub
		} else if (typeof anotherOctabyte == "object") {
			if (anotherOctabyte.size <= this.size) {
				this.clean();
				//this.bytes = anotherOctabyte.bytes;
				for (var i = 0; i < anotherOctabyte.size; ++i) {
					this.bytes[this.size - 1 - i] = anotherOctabyte.bytes[anotherOctabyte.size - 1 - i];
				}
			} else
				throw "Size mismatch";
		}
	}

	if (stringValue != null) { // конструктор размазало
		this.parseFromString(stringValue);
	}
}

function tetraCast(mb) {
	var x = new Multibyte(4, null);
	for (var i = 4; i <= 7; ++i)
		x.bytes[i - 4] = mb.bytes[i];

	return x;
}

function wordCast(mb) {
	var x = new Multibyte(2, null);
	for (var i = 6; i <= 7; ++i) 
		x.bytes[i - 6] = mb.bytes[i];

	return x;
}

function byteCast(mb) {
	var x = new Multibyte(1, null);
	x.bytes[0] = mb.bytes[7];

	return x;
}

// bc - bytes counts
function multibyteCast(bc, mb) {
	if (bc == 1)
		return byteCast(mb);
	if (bc == 2)
		return wordCast(mb);
	if (bc == 4)
		return tetraCast(mb);
	if (bc == 8)
		return mb;
}

function parseMultiFormatMultibyte(str) {
	
}
