var MMIX_INSTRUCTIONS = ["LDB", "LDW", "LDT", "LDO", "LDBU", "LDWU", "LDTU", "LDOU", "LDHT", "LDA", "STB", "STW", "STT", "STO", "STBU", "STWU", "STTU", "STTOU", "STHT", "STCO", "ADD", "SUB", "MUL", "DIV", "ADDU", "SUBU", "MULU", "DIVU", "NEG", "NEGU", "SL", "SLU", "SR", "SRU", "CMP", "CMPU", "CSN", "CSZ", "CSP", "CSOD", "CSNN", "CSNZ", "CSNP", "CSEV", "ZSN", "ZSZ", "ZSP", "ZSOD", "ZSNN", "ZSNZ", "ZSNP", "ZSEV", "AND", "OR", "XOR", "ANDN", "ORN", "NAND", "NOR", "NXOR", "MUX", "SADD", "BDIF", "WDIF", "TDIF", "ODIF", "MOR", "MXOR", "FADD", "FSUB", "FMUL", "FDIV", "FREM", "FSQRT", "FINT", "FCMP", "FEQL", "FUN", "FCMPE", "FEQLE", "FUNE", "FIX", "FIXU", "FLOT", "FLOTU", "SFLOT", "SFLOTU", "LDSF", "STSF", "SETH", "SETMH", "SETML", "SETL", "INCH", "INCHM", "INCML", "INCL", "ORH", "ORMH", "ORML", "ORL", "ANDNH", "ANDNMH", "ANDNML", "ANDNL", "JMP", "GO", "BN", "BZ", "BP", "BOD", "BNN", "BNZ", "BNP", "BEV", "PBN", "PBZ", "PBP", "PBOD", "PBNN", "PBNZ", "PBNP", "PBEV", "PUSHJ", "PUSHGO", "POP", "SAVE", "UNSAVE", "LDUNC", "STUNC", "PRELD", "PREST", "PREGO", "SYNCID", "SYNCD", "SYNC", "CSWAP", "LDVTS", "TRIP", "TRAP", "RESUME", "GET", "PUT", "GETA", "SWYM"];
//var MMIX_KEYWORDS = ["IS", "LOC"] + MMIX_INSTRUCTIONS;
var MMIX_KEYWORDS = MMIX_INSTRUCTIONS; // stub

function parsingError(description, lexem, line) {
	throw description + ": `" + lexem + "` at line `" + line + "`";
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

function checkUserSpaceWord(pretendWord) {
	return /^[a-z_][a-z_0-9]*$/i.test(pretendWord);
}

function checkExprParts(splitted) {
	for (var i in splitted) {
		var part = splitted[i];
		if (regexCheckNumber(part) || regexCheckRegister(part) || checkUserSpaceWord(part)) {
			// OK. stub
		} else if ("\"" + eval(part) + "\"" == part) {
			// OK. stub
		} else
			parsingError("Unrecognized lexem in EXPR", part, splitted.join(", "));
	}

	return true;
}

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

//	checkExprParts(splitted);
	return splitted;
}

function parseLine(line) {
	var splitted = line.split(" ");
	
	var result = {
		label: null,
		operand: null,
		expr: null
	};
	
	var realIndex = 0; // реальный индекс (с пропусками пустых сплитов)
	
	while (true) {
		var part = splitted[0];
		if (part.length != 0) {
			if (realIndex == 0) { 
				if (checkReservedWord(part)) {
					result.operand = part;
				} else if (checkUserSpaceWord(part)) { // метка - первое слово
					result.label = part;
				} else { // первое слово не опреранд и не метка
					throw parsingError("Unrecognized lexem", part, line);
				}
				splitted.shift();
			} else if (realIndex == 1) { 
				if (result.label != null) { // первым была метка
					if (checkReservedWord(part)) // действительно ли второе - операнд
						result.operand = part;
					else 
						throw parsingError("Unrecognized operand", part, line); // второе не операнд
				} else { // если первое - не метка, то второе - аргументы
					result.expr = parseExpr(part);
				}
				splitted.shift();
			} else if (realIndex >= 2)
				break;
			++realIndex;
		}
	}
	result.expr = parseExpr(splitted.join(""));

	return result;
}
