var MMIX_INSTRUCTIONS = ["LDB", "LDW", "LDT", "LDO", "LDBU", "LDWU", "LDTU", "LDOU", "LDHT", "LDA", "STB", "STW", "STT", "STO", "STBU", "STWU", "STTU", "STTOU", "STHT", "STCO", "ADD", "SUB", "MUL", "DIV", "ADDU", "SUBU", "MULU", "DIVU", "NEG", "NEGU", "SL", "SLU", "SR", "SRU", "CMP", "CMPU", "CSN", "CSZ", "CSP", "CSOD", "CSNN", "CSNZ", "CSNP", "CSEV", "ZSN", "ZSZ", "ZSP", "ZSOD", "ZSNN", "ZSNZ", "ZSNP", "ZSEV", "AND", "OR", "XOR", "ANDN", "ORN", "NAND", "NOR", "NXOR", "MUX", "SADD", "BDIF", "WDIF", "TDIF", "ODIF", "MOR", "MXOR", "FADD", "FSUB", "FMUL", "FDIV", "FREM", "FSQRT", "FINT", "FCMP", "FEQL", "FUN", "FCMPE", "FEQLE", "FUNE", "FIX", "FIXU", "FLOT", "FLOTU", "SFLOT", "SFLOTU", "LDSF", "STSF", "SETH", "SETMH", "SETML", "SETL", "INCH", "INCHM", "INCML", "INCL", "ORH", "ORMH", "ORML", "ORL", "ANDNH", "ANDNMH", "ANDNML", "ANDNL", "JMP", "GO", "BN", "BZ", "BP", "BOD", "BNN", "BNZ", "BNP", "BEV", "PBN", "PBZ", "PBP", "PBOD", "PBNN", "PBNZ", "PBNP", "PBEV", "PUSHJ", "PUSHGO", "POP", "SAVE", "UNSAVE", "LDUNC", "STUNC", "PRELD", "PREST", "PREGO", "SYNCID", "SYNCD", "SYNC", "CSWAP", "LDVTS", "TRIP", "TRAP", "RESUME", "GET", "PUT", "GETA", "SWYM"];
var MMIX_KEYWORDS = ["IS", "LOC", "GREG", "BYTE", "WYDE", "TETRA", "OCTA"].concat(MMIX_INSTRUCTIONS);

function parsingError(description, lexem, line) {
//	throw description + ": `" + lexem + "` at line `" + line + "`";
	makeError(ERROR_TYPE_LEXEM, description, line, -123);
}

function regexCheckNumber(pretendNumber) {
	return /^(#[0-9a-f]{1,16}|\d+)$/i.test(pretendNumber);
}

function regexCheckRegister(pretendRegister) {
	return /^\$(\d{1,3}|r[A-Z]{1,2})$/.test(pretendRegister);
}

function checkReservedWord(pretendWord) {
	return contains(MMIX_KEYWORDS, pretendWord);
}

function regexCheckUserSpaceWord(pretendWord) {
	return /^[a-z_][a-z_0-9]*$/i.test(pretendWord);
}

function isMacro(pretendWord) {
	return (pretendWord == 'IS' || pretendWord == 'GREG' || pretendWord == 'LOC');
}

function checkArithmetic(pretendPart) {
	//console.log("checkArithmetic(" + pretendPart + ")");
	if (regexCheckNumber(pretendPart) || pretendPart.trim().length == 0) {
		return true;
	}

	var i = 0;
	if (pretendPart[0] == '-') {
		i = 1;
	}

	var level = 0;
	var parStart = 0;
	var inWord = false; // указатель находится или в числе, или в @, или в идентификаторе, или в ()
	// (-5*a)
	for (; i < pretendPart.length; ++i) {
		//console.log("i = " + i);
		if (pretendPart[i] == '(') {
			if (i > 0) {
				var prchar = pretendPart[i - 1];
				if (!(prchar == '+' || prchar == '-' || prchar == '*' || prchar == '/')) {
					console.log("shit before opening parenthesis");
					return false; // до открывающей скобки идет не знак: ()(), ab()
				}
			}
			if (level == 0) {
				parStart = i;
			}
			++level;
			inWord = true;
		} else if (pretendPart[i] == ')') {
			--level;
			if (level == 0) {
				var parExpr = pretendPart.substring(parStart + 1, i);
				if (!checkArithmetic(parExpr)) {
					console.log(parExpr + " is shit! [recursive return]");
					return false; // выражение в скобках не удовлетворяет
				}
			}
			if (level < 0) {
				console.log("too much closing parentheses")
				return false; // стоит лишняя закрывающая скобка
			}
		} else if (level == 0) {
			var wchar = pretendPart[i]; // working character
			//console.log("wchar = " + wchar);
			if (wchar == '+' || wchar == '-' || wchar == '*' || wchar == '/') {
				if (inWord == false) {
					console.log("too much operators next to each other");
					return false; // много знаков подряд идет
				}
				inWord = false;
			} else if (/[a-zA-Z0-9@]/.test(wchar)) {
				if (i > 0) {
					if (pretendPart[i - 1] == ')') {
						console.log("shit after closing parenthesis");
						return false; // после закрывающей скобки идет не знак: ()(), ()ab, 
					}
				}
				inWord = true;
			} else
				throw "stub!";
		}
	}
	return true;
}

// проверяет, верны ли синтаксически аргументы
function checkExprParts(splitted) {
	for (var i in splitted) {
		var part = splitted[i];
		if (regexCheckNumber(part) || regexCheckRegister(part) || regexCheckUserSpaceWord(part) || checkArithmetic(part)) {
			// OK. stub
		} else if (part[0] == "\"" && part[part.length - 1] == "\"") {
			// OK. stub
		} else
			parsingError("Unrecognized lexem in EXPR", part, splitted.join(", "));
	}

	return true;
}

// разбивает часть EXPR на аргументы, которые отделаются запятой
function parseExpr(expr) {
	var splitted = [];
	var level = 0; // для ()
	var fromIndex = 0;
	var inString = false,
		quoting = false;
	for (var i = 0; i < expr.length; ++i) {
		if (inString) {
			if (expr[i] == "\\")
				quoting = true;
			else if (expr[i] == "\"") {
				if (quoting)
					quoting = false;
				else
					inString = false;
			}
			continue;
		}

		if (expr[i] == ',') {
			if (level == 0 && i - fromIndex >= 1) { // если глоб. знак и кусочек длиной >=1
				splitted.push(expr.substring(fromIndex, i))
				fromIndex = i + 1;
			}
		} else if (expr[i] == '(') {
			++level;
		} else if (expr[i] == ')') {
			--level;
		} else if (expr[i] == '"') {
			inString = true;
		}
	}
	splitted.push(expr.substring(fromIndex));

	checkExprParts(splitted);
	return splitted;
}

function parseLine(line) {
	var splitted = line.split(" ");
	
	var result = {
		label: null,
		operand: null, // строковое представление
		expr: null // массивчик из parseExpr
	};
	
	var realIndex = 0; // реальный индекс (с пропусками пустых сплитов)
	
	while (true) {
		if (realIndex >= 2)
			break;
		var part = splitted[0];		
		var capitalPart = part.toUpperCase();
		if (part.length != 0) {
			if (realIndex == 0) { 
				if (checkReservedWord(capitalPart)) {
					result.operand = capitalPart;
				} else if (checkUserSpaceWord(part)) { // метка - первое слово
					result.label = part;
				} else { // первое слово не опреранд и не метка
					throw parsingError("Unrecognized lexem", part, line);
				}
				splitted.shift();
			} else if (realIndex == 1) { 
				if (result.label != null) { // первым была метка
					if (checkReservedWord(capitalPart)) // действительно ли второе - операнд
						result.operand = capitalPart;
					else 
						throw parsingError("Unrecognized operand", part, line); // второе не операнд
				} else { // если первое - не метка, то второе - аргументы
					result.expr = parseExpr(splitted.join(""));
				}
				splitted.shift();
			} else if (realIndex >= 2)
				break;
			++realIndex;
		}
	}
	if (result.label != null) 
		result.expr = parseExpr(splitted.join(""));

	return result;
}

function isInteger(str) {
	return /^\d+/.test(str);
}

function exprTypeParser(exprEntity) {
	if (exprEntity[0] == '#') {
		return EXPR_TYPE_XNUM;
	} else if (isInteger(exprEntity)) {
		return EXPR_TYPE_NUM;
	} else if (exprEntity[0] == '$') {
		return EXPR_TYPE_REG;
	}
}
