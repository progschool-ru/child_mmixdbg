package  
{
	
	public class ProgramRunner 
	{
		public var memory:Array = []; // Массив для хранения битов памяти
		public var registers:Array = []; // Массив для хранения битов регистров
		public var lineNumber:int = 0; // номер исполняемой строки
		public var lastReg:int = 255; // номер наименьшего глобального регистра
		public var errorNumber:int = 0;
		public var varMatcher:VarMatcher = new VarMatcher();
		
		public function ProgramRunner(labelArr:Array,  opArr:Array,  exprArr:Array, memoryLimit:int) 
		{
			var l: int = labelArr.length;
			var i:int = 0;
			var j:int = 0;
			var dummyArr:Array = [];
			var dummyLength:int;
			//забиваем память и регистры нулями
			for (i = 0; i < 8 * memoryLimit; i++)
			{
				memory[i] = [];
				for (j = 0; j < 8; j++)
				{
					memory[i][j] = 0;
				}
			}
			for (i = 0; i < 256; i++) 
			{
				registers[i] = [];
				for (j = 0; j < 64; j++)
				{
					registers[i][j] = 0;
				}
			}
			
			for (i = 0; i < l; i++)
			{
				lineNumber = i; 
				if (opArr[i] == "GREG") 
				{
					if (exprArr[i][1] != "") 
					{
						errorNumber = 3; 
						break;
					}
					lastReg--; 
					dummyLength = exprArr[i][0].length;
					if (exprArr[i][0].charAt(0) != "#") 
					{
						for (j = 0; j < dummyLength; j++)
						{
							if ((exprArr[i][0].charAt(j) < '0' || exprArr[i][0].charAt(j) > '9') && (exprArr[i][0].charAt(j) < 'a' || exprArr[i][0].charAt(j) > 'f'))
								errorNumber = 4;
						}
						if (errorNumber == 0) 
							errorNumber = writeHexToReg(Number(exprArr[i][0]).toString(16), lastReg);
					}
					else
					{
						errorNumber = writeHexToReg(exprArr[i][0].substring(1, dummyLength), lastReg);
					}
					if (labelArr[i] != "") 
						varMatcher.addReg(labelArr[i], lastReg);
				}
				else if (opArr[i] == "IS")
				{
					if (exprArr[i][1] != "" || exprArr[i][0] == "") 
					{
						errorNumber = 3; 
						break;
					}
					if (labelArr[i] != "") 
						varMatcher.addVal(labelArr[i], exprArr[i][0]);
				}
				else if (opArr[i] == "ADD")
				{
					if (exprArr[i][2] == "" || exprArr[i][1] == "" || exprArr[i][0] == "") 
					{
						errorNumber = 3; 
						break;
					}
					dummyArr = matchVars(exprArr[i], 3);
					if (errorNumber == 0)
					{
						for (j = 0; j < 3; j++)
						{
							dummyLength = dummyArr[j].length;
							dummyArr[j] = (int)(dummyArr[j].substring(1, dummyLength));
						}
						registers[dummyArr[0]] = add(registers[dummyArr[1]], registers[dummyArr[2]]);
					}
				}
				if (errorNumber != 0)
					break;
			}
		//	var ar:Array = varMatcher.findVar("a");
		//	trace(ar[ar[0]]);
		}
		
		public function matchVars(vars:Array, n:int):Array
		// принимает массив из n переменных/регистров, возвращает массив соответствующих регистров
		{
			var res:Array = vars;
			for (var i:int = 0; i < n; i++)
			{
				if (vars[i].charAt(0) != "$") 
				{
					var dummy:Array = varMatcher.findVar(vars[i]);
					if (dummy[1] == -1)
					{
						errorNumber = 4; 
						// нужно перепроверить верно ли выдавать ошибку
					}
					else
						res[i] = "$" + dummy[1];
				}
				else
				{
					var l:int = vars[i].length;
					if (l == 1) 
						errorNumber = 4;
					for (var j:int = 1; j < l; j++)
					{
						if (vars[i].charAt(j) < '0' || vars[i].charAt(j)  > '9') 
							errorNumber = 4;
					}
				}
			}
			return res;
		}
		
		public function writeHexToReg(number:String, reg:int):int
		//записывает шестнадцаричное число в указанный регистр, возвращает номер ошибки
		{
			var l:int = number.length;
			var i:int = 0;
			if (l > 16) return 5;
			while (l < 16)
			{
				l++;
				number = "0" + number;
			}
			for (i = 0; i < 16; i++)
			{
				if ((number.charAt(i) < '0' || number.charAt(i) > '9') && (number.charAt(i) < 'a' || number.charAt(i) > 'f'))
					return 4;
			}
			for (i = 0; i < 16; i++)
			{
				var decimal:int; //десятичная запись цифры из 16ричного числа
				if (number.charAt(i) == 'f') decimal = 15; 
				else if (number.charAt(i) == 'e') decimal = 14; 
				else if (number.charAt(i) == 'd') decimal = 13; 
				else if (number.charAt(i) == 'c') decimal = 12; 
				else if (number.charAt(i) == 'b') decimal = 11; 
				else if (number.charAt(i) == 'a') decimal = 10; 
				else decimal = int(number.charAt(i));
				registers[reg][i * 4] = 0;
				registers[reg][i * 4 + 1] = 0;
				registers[reg][i * 4 + 2] = 0;
				registers[reg][i * 4 + 3] = 0;
				if (decimal % 2 >= 1) registers[reg][i * 4 + 3] = 1;
				if (decimal % 4 >= 2) registers[reg][i * 4 + 2] = 1;
				if (decimal % 8 >= 4) registers[reg][i * 4 + 1] = 1;
				if (decimal % 16 >= 8) registers[reg][i * 4] = 1;
			}
			return 0;
		}
		
		public function getErrorText(n:int):String //возвращает текст ошибки по ее номеру
		{
			if (n == 0) return "Done";
			if (n == 3) return "Wrong number of arguments at line " + (lineNumber + 1);
			if (n == 4) return "Wrong type of argument at line " + (lineNumber + 1);
			if (n == 5) return "Overflow error at line " + (lineNumber + 1);
			
			return "Unknown error at line " + (lineNumber + 1);
		}
		
		
		
		public function add(Y:Array, Z:Array):Array
		{
			var X:Array = []; // результат
			var columnAdditionHelper:int = 0; 
			for (var i:int = 63; i >= 0; i--)
			{
				X[i] = (Y[i] + Z[i] + columnAdditionHelper) % 2;
				columnAdditionHelper = (Y[i] + Z[i] + columnAdditionHelper) / 2;
			}
			if (columnAdditionHelper == 1) 
				errorNumber = 5;
			return X;
		}
		
	}

}