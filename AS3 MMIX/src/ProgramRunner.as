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
						registers[lastReg] = decimalToBin(exprArr[i][0]);
					}
					else
					{
						registers[lastReg] = hexToBin(exprArr[i][0].substring(1, dummyLength));
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
				else if (opArr[i] == "ADD" || opArr[i] == "ADDU")
				{
					if (exprArr[i][2] == "" || exprArr[i][1] == "" || exprArr[i][0] == "") 
					{
						errorNumber = 3; 
						break;
					}
					dummyArr = matchVars(exprArr[i], 3);
					if (errorNumber == 0)
					{
						if (!checkForReg(dummyArr[0]))
							errorNumber = 4;
						else
						{
							dummyLength = dummyArr[0].length;
							dummyArr[0] = (int)(dummyArr[0].substring(1, dummyLength));
						}
						for (j = 1; j < 3; j++)
						{
							dummyLength = dummyArr[j].length;
							if(checkForReg(dummyArr[j]))
								dummyArr[j] = registers[(int)(dummyArr[j].substring(1, dummyLength))];
							else if (checkForHex(dummyArr[j]))
								dummyArr[j] = hexToBin(dummyArr[j].substring(1, dummyLength));
							else 
								dummyArr[j] = decimalToBin(dummyArr[j]);
						}
						if(opArr[i] == "ADD")
							registers[dummyArr[0]] = add(dummyArr[1], dummyArr[2], false);
						else if (opArr[i] == "ADDU")
							registers[dummyArr[0]] = add(dummyArr[1], dummyArr[2], true);
					}
				}
				else if (opArr[i] == "CMP" || opArr[i] == "CMPU")
				{
					if (exprArr[i][2] == "" || exprArr[i][1] == "" || exprArr[i][0] == "") 
					{
						errorNumber = 3; 
						break;
					}
					dummyArr = matchVars(exprArr[i], 3);
					if (errorNumber == 0)
					{
						if (!checkForReg(dummyArr[0]))
							errorNumber = 4;
						else
						{
							dummyLength = dummyArr[0].length;
							dummyArr[0] = (int)(dummyArr[0].substring(1, dummyLength));
						}
						for (j = 1; j < 3; j++)
						{
							dummyLength = dummyArr[j].length;
							if(checkForReg(dummyArr[j]))
								dummyArr[j] = registers[(int)(dummyArr[j].substring(1, dummyLength))];
							else if (checkForHex(dummyArr[j]))
								dummyArr[j] = hexToBin(dummyArr[j].substring(1, dummyLength));
							else 
								dummyArr[j] = decimalToBin(dummyArr[j]);
						}
						if(opArr[i] == "CMP")
							registers[dummyArr[0]] = compare(dummyArr[1], dummyArr[2], false);
						else if (opArr[i] == "CMPU")
							registers[dummyArr[0]] = compare(dummyArr[1], dummyArr[2], true);
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
				if ((vars[i].charAt(0) < '0' || vars[i].charAt(0) > '9') && vars[i].charAt(0) != '$' && vars[i].charAt(0) != '#') 
				{
					var dummy:Array = varMatcher.findVar(vars[i]);
					if (dummy[0] == -1)
						errorNumber = 4; 
					else
					{
						res[i] = dummy[dummy[0]]
						if(dummy[0] == 1)
							res[i] = "$" + dummy[1];
					}
				}
				if (!(checkForDecimal(vars[i]) || checkForHex(vars[i]) || checkForReg(vars[i])))
				{
					errorNumber = 4;
					return res;
				}
			}
			return res;
		}
		
		public function hexToBin(number:String):Array
		//Переводит 16ричное число в двоичное, представленное массивом длины 64.
		{
			var res:Array = [];
			var l:int = number.length;
			var i:int = 0;
			if (l > 16) 
			{
				errorNumber = 5;
				return res;
			}
			while (l < 16)
			{
				l++;
				number = "0" + number;
			}
			if (!checkForHex("#" + number))
			{
				errorNumber = 4;
				return res;
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
				res[i * 4] = 0;
				res[i * 4 + 1] = 0;
				res[i * 4 + 2] = 0;
				res[i * 4 + 3] = 0;
				if (decimal % 2 >= 1) res[i * 4 + 3] = 1;
				if (decimal % 4 >= 2) res[i * 4 + 2] = 1;
				if (decimal % 8 >= 4) res[i * 4 + 1] = 1;
				if (decimal % 16 >= 8) res[i * 4] = 1;
			}
			return res;
		}
		
		public function decimalToBin(number:String) : Array
		//преобразовывает 10-чное число в двоичное, представленное массивом длины 64.
		{
			var res:Array = [];
			if(!checkForDecimal(number))
			{
				errorNumber = 4;
				return res;
			}
			var l:int = number.length;
			if (number.charAt(0) == "+")
				res = hexToBin(Number(number.substring(1,l)).toString(16));
			else if (number.charAt(0) == "-")
				res = changeSign(hexToBin(Number(number.substring(1,l)).toString(16)));
			else 
				res = hexToBin(Number(number).toString(16));
			return res;
		}
		
		
		public function getErrorText(n:int):String //возвращает текст ошибки по ее номеру
		{
			if (n == 0) return "Done";
			if (n == 3) return "Wrong number of arguments at line " + (lineNumber + 1);
			if (n == 4) return "Wrong type of argument at line " + (lineNumber + 1);
			if (n == 5) return "Overflow error at line " + (lineNumber + 1);
			
			return "Unknown error at line " + (lineNumber + 1);
		}
		
		public function checkForReg(number:String):Boolean
		//Проверяет является ли строка символов номером регистра
		{
			var l:int = number.length;
			if (l < 2) 
				return false;
			if (number.charAt(0) != '$')
				return false
			for (var i:int = 1; i < l; i++)
			{
				if (number.charAt(i) < '0' || number.charAt(i) > '9')
				{
					return false;
				}
			}
			var dummyNum:int = int(number.substring(1, l));
			if (dummyNum < 0 || dummyNum > 255)
				return false;
			return true;
		}
		public function checkForHex(number:String):Boolean
		//Проверяет является ли строка символов 16-чным числом
		{
			var l:int = number.length;
			if (l < 2) 
				return false;
			if (number.charAt(0) != '#')
				return false
			for (var i:int = 1; i < l; i++)
			{
				if ((number.charAt(i) < '0' || number.charAt(i) > '9') && (number.charAt(i) < 'a' || number.charAt(i) > 'f'))
				{
					return false;
				}
			}
			return true;
		}
		
		public function checkForDecimal(number:String):Boolean
		//Проверяет является ли непустая строка символов 10-чным числом
		{
			if (number.charAt(0) != "+" && number.charAt(0) != "-")
				number = "+" + number;
			var l:int = number.length;
			if (l < 2)
				return false;
			for (var i:int = 1; i < l; i++)
			{
				if (number.charAt(i) < '0' || number.charAt(i) > '9')
				{
					return false;
				}
			}
			return true;
		}
		
		public function compare(Y:Array, Z:Array, unsigned:Boolean):Array
		//cравнивает двоичные числа Y, Z и возвращает в двоичной записи число 1, если Y больше; -1, если Z больше; 0, если Z = X
		{
			var X:Array = []; //результат
			var i:int = 0;
			for (i = 0; i < 63; i++)
				X[i] = 0;
			X[63] = 1;
			if (!unsigned)
			{
				if (Y[0] > Z[0])
					return changeSign(X);
				else if (Z[0] > Y[0])
					return X;
			}
			for (i = 0; i < 64; i++)
			{
				if (Y[i] > Z[i])
					return X;
				else if (Z[i] > Y[i])
					return changeSign(X);
			}
			X[63] = 0;
			return X;
		}
		
		public function add(Y:Array, Z:Array, unsigned:Boolean):Array
		{
			var X:Array = []; // результат
			var columnAdditionHelper:int = 0; 
			for (var i:int = 63; i >= 0; i--)
			{
				X[i] = (Y[i] + Z[i] + columnAdditionHelper) % 2;
				columnAdditionHelper = (Y[i] + Z[i] + columnAdditionHelper) / 2;
			}
			if (!unsigned && Y[0] == Z[0] && X[0] != Y[0]) 
				errorNumber = 5;
			return X;
		}
		
		public function substract(Y:Array, Z:Array, unsigned:Boolean):Array
		{
			var X:Array = []; // результат
			var columnSubstractionHelper:int = 0; 
			for (var i:int = 63; i >= 0; i--)
			{
				X[i] = Y[i] - Z[i] - columnSubstractionHelper;
				columnSubstractionHelper = 0;
				if (X[i] < 0)
				{
					X[i] += 2;
					columnSubstractionHelper = 1;
				}
			}
			if (!unsigned && Y[0] == 1 && X[0] == 0) 
				errorNumber = 5;
			return X;
		}
		
		public function changeSign(X:Array):Array
		{
			var dummyArr:Array = [];
			var dummyArr2:Array = [];
			for (var i:int = 0 ; i < 64; i++)
			{
				dummyArr[i] = 1;
				dummyArr2[i] = 0;
			}
			dummyArr2[63] = 1;
			return add(substract(dummyArr, X, true), dummyArr2, true);
		}
		
	}

}