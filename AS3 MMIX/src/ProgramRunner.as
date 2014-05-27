package  
{
	/**
	 * ...
	 * @author Jay Tord
	 */
	public class ProgramRunner 
	{
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
		public var exprArr:Array = []; // массив параметров
		public function ProgramRunner(progText:String) 
		{
			
		}
		
	}

}