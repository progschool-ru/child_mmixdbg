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
		public function MMIXCompiler() 
		{
			//addEventListener(Event.ENTER_FRAME, onFrame);
			
			//отрисовываем все элементы, видные на экране
			new ColoredRectangle(15, 75, 400, 500, 0xffffff, this);
			new ColoredText(16, 15, 75, 400, 500, "", 0x000000, this, true);
			new ColoredRectangle(440, 0, 5, 600, 0x000000, this);
			new ColoredRectangle(940, 0, 5, 400, 0x000000, this);
			new ColoredRectangle(440, 400, 1280 - 440, 5, 0x000000, this);
			
			//Этого блока потом быть не должно 
			new ColoredText(40, 15, 15, 400, 500, "Тут будут кнопки", 0x000000, this, false);
			new ColoredText(40, 515, 15, 400, 500, "Тут будет память ", 0x000000, this, false);
			new ColoredText(40, 955, 15, 400, 500, "Тут будут регистры", 0x000000, this, false);
			new ColoredText(40, 515, 415, 400, 500, "Тут будут сообщения об ошибках", 0x000000, this, false);
		}

	}

}