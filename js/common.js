var COMMAND_SIZE = 4;
function ord(string) {
	return string.charCodeAt(0);
}

function chr(charCode) {
	return String.fromCharCode(charCode);
}

function find(a, obj) {
	var i = a.length;
	while (i--) {
		if (a[i] == obj) {
			return i;
		}
	}
	return null;
}

function contains(a, obj) {
	return find(a, obj) != null;
}

String.prototype.replicate = function(num) {
    return new Array( num + 1 ).join( this );
}

String.prototype.addLeadingZeros = function(len) {
	if (this.length < len) {
		return "0".replicate(len - this.length) + this;
	} else
		return this;
}