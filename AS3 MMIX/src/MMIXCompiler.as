package  
{
	import flash.display.Sprite;
	import flash.events.Event;
	import flash.events.MouseEvent;
	import flash.events.KeyboardEvent;
	
	 
	public class MMIXCompiler extends Sprite
	{
		public const MAINMODE:String = "Main Mode";
		
		public var mode:String = MAINMODE; // режим отвечающий за то что происходит с MMIX-программой (компилируется, дебажится или пишется)
		public var registers:Array = []; // Массив для хранения битов регистров
		public var registersText:String; // Строка для вывода всех регистров на экран
		public var memoryLimit:int = 332; // Количество октабайт, отображаемых на экране
		public var memory:Array = []; // Массив для хранения битов памяти
		public var memoryText:String; // Строка для вывода содержимого памяти на экран
		public function MMIXCompiler() 
		{
			//addEventListener(Event.ENTER_FRAME, onFrame);
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
			//отрисовываем все элементы, видные на экране
			new ColoredRectangle(15, 75, 400, 500, 0xffffff, this);
			new ColoredText(16, 15, 75, 400, 500, "", 0x000000, this, true);
			new ColoredRectangle(440, 0, 5, 600, 0x000000, this);
			new ColoredRectangle(1040, 0, 5, 400, 0x000000, this);
			new ColoredRectangle(440, 400, 1280 - 440, 5, 0x000000, this);
				//Заполняем сегмент для содержимого регистров
			registersText = ""; 
			for (i = 0; i < 256; i++) 
			{
				registersText += "$" + i + " ";
				if (i < 10) registersText += "  "; 
				if (i < 100) registersText += "  ";
				registersText += "#";
				for (j = 0 ; j < 16; j++)
				{
					registersText += transformNumberSystem(registers[i][4 * j], registers[i][4 * j + 1], registers[i][4 * j + 2], registers[i][4 * j + 3]);
				}
				registersText += '\n';
			}
			new ColoredText(18, 1055, 10, 220, 400, registersText, 0x000000, this, false);
				//Заполняем сегмент для содержимого памяти
			memoryText = "";
			for (i = 0; i < memoryLimit; i++) 
			{
				/*memoryText += "$" + i + " ";
				if (i < 10) memoryText += "  "; 
				if (i < 100) memoryText += "  ";*/
				for (j = 0 ; j < 16; j++)
				{
					memoryText += transformNumberSystem(memory[i][4 * j], memory[i][4 * j + 1],	memory[i][4 * j + 2], memory[i][4 * j + 3]);
					if (j % 2 == 1) memoryText += " ";
				}
				if (i % 2 == 1)
					memoryText += '\n';
				else
					memoryText += "   ";
			}
			new ColoredText(18, 515, 10, 500, 400, "00 01 02 03 04 05 06 07    08 09 0a 0b 0c 0d 0e 0f", 0x888888, this, false);
			new ColoredText(18, 515, 35, 500, 380, memoryText, 0x000000, this, false);
			//Этого блока потом быть не должно 
			new ColoredText(40, 15, 15, 400, 500, "Тут будут кнопки", 0x000000, this, false);
			new ColoredText(40, 515, 415, 400, 500, "Тут будут сообщения об ошибках", 0x000000, this, false);
		}
		
		public function transformNumberSystem(bit1:int, bit2:int, bit3:int, bit4:int) : String
		// переводит запись четырёх битов из 2-ичной системы в 16-ричную
		{
			var numberInFour:int = 8 * bit1 + 4 * bit2 + 2 * bit3 + bit4;
			if (numberInFour == 10) return 'a';
			if (numberInFour == 11) return 'b';
			if (numberInFour == 12) return 'c';
			if (numberInFour == 13) return 'd';
			if (numberInFour == 14) return 'e';
			if (numberInFour == 15) return 'f';
			var returnedString:String = "";
			returnedString += numberInFour;
			return returnedString;
		}
	}

}