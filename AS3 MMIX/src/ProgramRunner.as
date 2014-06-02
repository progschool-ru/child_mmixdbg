package  
{
	
	public class ProgramRunner 
	{
		public var memory:Array = []; // Массив для хранения битов памяти
		public var registers:Array = []; // Массив для хранения битов регистров
		
		public function ProgramRunner(labelArr:Array,  opArr:Array,  exprArr:Array, memoryLimit:int) 
		{
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
		}
		
	}

}