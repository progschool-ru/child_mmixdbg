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

function findCond(a, cond) {
	for (var i = 0; i < a.length; ++i) {
		if (cond(a[i]))
			return i;
	}

	return -1;
}

function find(a, obj) {
	return findCond(a, function(ai) { return ai == obj; });
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

function replicateArray(arr) {
	return arr.map( function(x) { return x; } );
}


function intToBytes(intval) {
	var result = [];
	result.push(intval >> 24);
	result.push((intval >> 16) & 0xff);
	result.push((intval >> 8) & 0xff);
	result.push(intval & 0xff);

	return result;
}