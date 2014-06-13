package  
{
	import flash.display.Sprite;
	import flash.events.Event;
	import flash.events.MouseEvent;
	import flash.events.KeyboardEvent;
	 
	public class GraphicsUpdater extends Sprite
	{
		public const MAINMODE:String = "Main Mode";
		public const RUNNING:String = "Running";
		
		public var programColoredText:ColoredText; // переменная для получения введенного пользователем текста программы
		public var programText:String = ""; // содержит введенный пользователем текст программы
		public var programParser:ProgramParser; //отвечает за парсинг программы, введенной пользователем 
		public var programRunner:ProgramRunner; // отвечает за исполнение программы, введенной пользователем
		public var mode:String = MAINMODE; // режим отвечающий за то что происходит с MMIX-программой (компилируется, дебажится или пишется)
		public var registersText:String; // Строка для вывода всех регистров на экран
		public var memoryLimit:int = 64; // Количество октабайт, отображаемых на экране
		public var memoryText:String; // Строка для вывода содержимого памяти на экран
		public var runButton:Sprite = new Sprite; // Кнопка для запуска программы
		public var errorText:String = ""; // содержит информацию об ошибках 
		
		public function GraphicsUpdater() 
		{
			programParser = new ProgramParser(programText);				
			programRunner = new ProgramRunner(programParser.labelArr, programParser.opArr, programParser.exprArr, memoryLimit);
			graphicsUpdate();
		}
		
		public function onClick (e:Event = null):void
		{
			if (mode == MAINMODE)
			{
				mode = RUNNING;
				programText = programColoredText.txt.text;
				programParser = new ProgramParser("");				
				programRunner = new ProgramRunner(programParser.labelArr, programParser.opArr, programParser.exprArr, memoryLimit);
				graphicsUpdate();
				programParser = new ProgramParser(programText);
				errorText = programParser.getErrorText(programParser.errorNumber);
				if(programParser.errorNumber == 0)
					{
						programRunner = new ProgramRunner(programParser.labelArr, programParser.opArr, programParser.exprArr, memoryLimit);
						errorText = programRunner.getErrorText(programRunner.errorNumber);
					}
					mode = MAINMODE;
					graphicsUpdate();
			}
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
		
		public function graphicsUpdate() : void			//отрисовывает все элементы, видные на экране
		{
			var i:int = 0;
			var j:int = 0;
			while (this.numChildren) // удаляет все с поля
			{
				this.removeChildAt(0);
			}
			new ColoredRectangle(15, 75, 400, 500, 0xffffff, this);
			programColoredText = new ColoredText(16, 15, 75, 400, 500, programText, 0x000000, this, true, true);
			new ColoredRectangle(440, 0, 5, 600, 0x000000, this);
			new ColoredRectangle(1040, 0, 5, 400, 0x000000, this);
			new ColoredRectangle(440, 400, 1280 - 440, 5, 0x000000, this);
			//создаем кнопки
			runButton.x = 15;
			runButton.y = 15; 
			runButton.graphics.beginFill(0x000000 , 10);
			runButton.graphics.drawRect(0,0,100,40);
			runButton.addEventListener(MouseEvent.CLICK, onClick);
			addChild(runButton);
			if(mode == MAINMODE)
				new ColoredText(26, 40, 20, 100, 50, "Run", 0xffffff, this, false, false);
			else if (mode == RUNNING)
				new ColoredText(26, 17, 20, 100, 50, "Running", 0xffff00, this, false, false);
			//Заполняем сегмент для содержимого регистров
			registersText = ""; 
			for (i = 0; i < 256; i++) 
			{
				registersText += "$" + i + " ";
				if (i < 10) registersText += " "; 
				if (i < 100) registersText += " ";
				registersText += "#";
				for (j = 0 ; j < 16; j++)
				{
					registersText += transformNumberSystem(programRunner.registers[i][4 * j], programRunner.registers[i][4 * j + 1], programRunner.registers[i][4 * j + 2], programRunner.registers[i][4 * j + 3]);
				}
				registersText += '\n';
			}
			new ColoredText(14, 1065, 10, 220, 400, registersText, 0x000000, this, false, true);
			//Заполняем сегмент для содержимого памяти
			memoryText = "";
			for (i = 0; i < memoryLimit; i++) 
			{
				if (i % 2 == 0)
				{
					memoryText += "#";
					memoryText += decimalToHex(8 * i, 16);
					memoryText += "   ";
				}
				for (j = 0 ; j < 16; j++)
				{
					memoryText += transformNumberSystem(programRunner.memory[i][4 * j], programRunner.memory[i][4 * j + 1],	programRunner.memory[i][4 * j + 2], programRunner.memory[i][4 * j + 3]);
					if (j % 2 == 1) memoryText += " ";
				}
				if (i % 2 == 1)
					memoryText += '\n';
				else
					memoryText += "   ";
			}
			new ColoredText(14, 610, 10, 410, 20, "00 01 02 03 04 05 06 07    08 09 0a 0b 0c 0d 0e 0f", 0x888888, this, false, true);
			new ColoredText(14, 450, 35, 570, 370, memoryText, 0x000000, this, false, true);
			new ColoredText(18, 450, 415, 800, 500, errorText, 0x000000, this, false, true);
		}
		
		public function decimalToHex(number:int, lenght:int) : String
		//преобразовывает 10-чное число в строку нужной длины, содержащую 16-ричную запись этого числа
		{
			var returnedString:String = "";
			returnedString = Number(number).toString(16);
			var l:int = returnedString.length;
			while (l < lenght)
			{
				l++;
				returnedString = "0" + returnedString;
			}
			return returnedString;
		}
	}

}