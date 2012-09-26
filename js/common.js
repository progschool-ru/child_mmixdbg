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
