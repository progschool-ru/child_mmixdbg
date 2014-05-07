package  
{
	import flash.display.Sprite;
	import flash.text.TextField;
	import flash.text.TextFieldType;
	import flash.text.TextFormat;
	
	//Класс для удобного создания текстовых полей
	public class ColoredText extends Sprite
	{
		
		public function ColoredText(size:int, x:Number, y:Number, width:Number, height:Number, text:String, color:uint, shape:Sprite, isEditBox:Boolean, isMouseAllowed:Boolean) 
		{
				var txtform:TextFormat = new TextFormat;
				txtform.size = size;
				var txt:TextField = new TextField;
				if (isEditBox)
				{
					txt.type = TextFieldType.INPUT;
					txt.border = true;
				}
				else if(isMouseAllowed)
				{
					txtform.font = "Courier New";
				}
				else
				{
					txt.mouseEnabled = false;					
				}
				txt.defaultTextFormat = txtform;
				txt.text = text;
				txt.y = y;
				txt.x = x;
				txt.width = width;
				txt.height = height;
				txt.wordWrap = true;
				txt.textColor = color;
				shape.addChild(txt);
		}
		
	}

}