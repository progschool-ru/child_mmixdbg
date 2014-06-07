package  
{
	
	public class ProgramRunner 
	{
		public var memory:Array = []; // Массив для хранения битов памяти
		public var registers:Array = []; // Массив для хранения битов регистров
		public var lineNumber:int = 0; // номер исполняемой строки
		public var lastReg:int = 255; // номер наименьшего глобального регистра
		public var errorNumber:int = 0;
		
		public function ProgramRunner(labelArr:Array,  opArr:Array,  exprArr:Array, memoryLimit:int) 
		{
			var l: int = labelArr.length;
			var i:int = 0;
			var j:int = 0;
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
					var dummyLenght:int = exprArr[i][0].length;
					if (exprArr[i][0].charAt(0) != "#") 
					{
						for (j = 0; j < dummyLenght; j++)
						{
							if ((exprArr[i][0].charAt(j) < '0' || exprArr[i][0].charAt(j) > '9') && (exprArr[i][0].charAt(j) < 'a' || exprArr[i][0].charAt(j) > 'f'))
								errorNumber = 4;
							else trace(exprArr[i][0].charAt(j));
						}
						if (errorNumber == 0) errorNumber = WriteHexToReg(Number(exprArr[i][0]).toString(16), lastReg);
					}
					else
					{
						errorNumber = WriteHexToReg(exprArr[i][0].substring(1, dummyLenght), lastReg);
					}
					if (errorNumber != 0)
						break;
				}
			}
		}
		
		public function WriteHexToReg(number:String, reg:int):int
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
			if (n == 5) return "Too big number at line " + (lineNumber + 1);
			
			return "Unknown error";
		}
		
	}

}