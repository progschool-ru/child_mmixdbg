package  
{

	public class ProgramParser 
	{
		public const LABEL:String = "Label";
		public const OP:String = "OP";
		public const EXPR:String = "EXPR";
		public const ALLOP:Array = ["TRAP", "FCMP", "FUN", "FEQL", "FADD", "FIX", "FSUB", "FIXU", "FLOT", "FLOTU", "SFLOT",
		"SFLOTU", "FMUL", "FCMPE", "FUNE", "FEQLE", "FDIV", "FSQRT", "FREM", "FINT", "MUL", "MULU", "DIV", "DIVU", "ADD",
		"ADDU", "SUB", "SUBU", "2ADDU", "4ADDU", "8ADDU", "16ADDU", "CMP", "CMPU", "NEG", "NEGU", "SL", "SLU", "SR", "SRU", 
		"BN", "BZ", "BP", "BOD", "BNN", "BNZ", "BNP", "BEV", "PBN", "PBZ", "PBP", "PBOD", "PBNN", "PBNZ", "PBNP", "PBEV", 
		"CSN", "CSZ", "CSP", "CSOD", "CSNN", "CSNZ", "CSNP", "CSEV", "ZSN", "ZSZ", "ZSP", "ZSOD", "ZSNN", "ZSNZ", "ZSNP",
		"ZSEV", "LDB", "LDBU", "LDW", "LDWU", "LDT", "LDTU", "LDO", "LDOU", "LDSF", "LDHT", "CSWAP", "LDUNC", "LDVTS", "PRELD",
		"PREGO", "GO", "STB", "STBU", "STW", "STWU", "STT", "STTU", "STO", "STOU", "STSF", "STHT", "STCO", "STUNC", "SYNCD",
		"PREST", "SYNCID", "PUSHGO", "OR", "ORN", "NOR", "XOR", "AND", "ANDN", "NAND", "NXOR", "BDIF", "WDIF", "TDIF", "ODIF",
		"MUX", "SADD", "MOR", "MXOR", "SETH", "SETMH", "SETML", "SETL", "INCH", "INCMH", "INCML", "INCL", "ORH", "ORMH", "ORML",
		"ORL", "ANDNH", "ANDNMH", "ANDNML", "ANDNL", "JMP", "PUSHJ", "GETA", "PUT", "POP", "RESUME", "SAVE", "SYNC", "SWYM", "GET", 
		"TRIP", "IS", "GREG", "LOC", "BYTE", "WYDE", "TETRA", "OCTA"]; // список всех возможных оп-кодов
		
		public var labelArr:Array = []; // массив меток
		public var opArr:Array = []; // массив опкодов
		public var exprArr:Array = []; //двойной массив параметров
		public var errorNumber:int = 0;
		public var lineNumber:int = 0; // номер строки введенной программы

		public function ProgramParser(progText:String) 
		{
			progText += '\n'; //требуется для корректного считывания последней строки
			var i:int = 0;
			var dummyStr:String = ""; //переменная для записывания слов из введенной программы 
			var curMode:String = LABEL; //отвечает за то в какой массив запишется dummyStr
			var argsNumber:int = 0; //текущий номер аргумента
			exprArr[lineNumber] = new Array();
			for (i = 0; i < progText.length; i++)
			{
				if (curMode == LABEL) //считываем первое слово в строке
				{
					if (progText.charAt(i) == ' ')
					{
						if (dummyStr != "")
						{
							if (compareWithAllop(dummyStr)) 
							{
								opArr[lineNumber] = dummyStr;
								labelArr[lineNumber] = "";
								curMode = EXPR;
							}
							else
							{
								labelArr[lineNumber] = dummyStr;
								curMode = OP;
							}
							exprArr[lineNumber] = ["", "", ""];
							dummyStr = "";
						}
					}
					else if (progText.charAt(i) != '\r' && progText.charAt(i) != '\n')
					{
						dummyStr += progText.charAt(i);
					}
				}
				else if (curMode == OP) // была считана метка, считываем оп-код
				{
					if (progText.charAt(i) == ' ')
					{
						if (dummyStr != "")
						{
							if (compareWithAllop(dummyStr)) 
							{
								opArr[lineNumber] = dummyStr;
								curMode = EXPR;
								dummyStr = "";
							}
							else
							{
								errorNumber = 1;
								break;
							}
						}
					}
					else
					{
						dummyStr += progText.charAt(i);
					}
				}
				else if (curMode == EXPR) // считываем аргументы
				{
					if (progText.charAt(i) == '\r' || progText.charAt(i) == '\n')
					{
						exprArr[lineNumber][argsNumber] = dummyStr;
						curMode = LABEL;
						dummyStr = "";
						argsNumber = 0;
						lineNumber ++;
						
						exprArr[lineNumber] = new Array();
					}
					else if (progText.charAt(i) == ',')
					{
						if (dummyStr != "")
						{
							exprArr[lineNumber][argsNumber] = dummyStr;
							dummyStr = "";
							argsNumber++;
						}
						else
						{
							errorNumber = 2;
							break;
						}
					}
					else if (progText.charAt(i) != ' ')
					{
						dummyStr += progText.charAt(i);
					}
				}
			}
			/*trace(lineNumber);
			for (i = 0; i < lineNumber; i++)
			{
				var qwe:String = "";
				for (var jkl:int = 0; jkl < 3 && exprArr[i][jkl]!=""; jkl++)
					qwe += exprArr[i][jkl] + ","; 
				trace(labelArr[i] + " " + opArr[i] + " " + qwe);
			}*/
		}
		
		public function compareWithAllop(s:String):Boolean //проверяет является ли строка оператором MMIX/MMIXAL
		{
			for (var i:int = 0; i < ALLOP.length; i++)
				if (ALLOP[i] == s)
					return true;
			return false;
		}
		
		public function getErrorText(n:int):String //возвращает текст ошибки по ее номеру
		{
			if (n == 0) return "Done";
			if (n == 1) return "Wrong op-code at line " + lineNumber;
			if (n == 2) return "Unexpected ',' at line " + lineNumber;
			return "Unknown error";
		}
	}
}
