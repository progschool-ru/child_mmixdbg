package  
{
	import flash.display.Sprite;
	
	//Класс для удобного создания прямоугольников и линий.
	public class ColoredRectangle extends Sprite
	{
		public function ColoredRectangle(x:Number, y:Number, width:Number, height:Number, color:uint, shape:Sprite)  
		{
				var rectangle:Sprite = new Sprite;
				rectangle.graphics.beginFill(color, 1);
				rectangle.graphics.drawRect(x, y, width, height);
				shape.addChild(rectangle);
		}
	}

}