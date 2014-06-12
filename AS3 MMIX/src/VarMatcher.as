package  
{
	
	public class VarMatcher 
	//класс для хранения переменных, заведенных пользователем, и сопостовления им значений.
	{
		public var vars:Array = []; // массив переменных
		public var registers:Array = []; //массив соответствующих переменным регистров
		public var values:Array = []; //массив соответствующих переменным значений
		public var varNumber:int = 0; // число переменных 
		
		public function addReg(variable:String, reg:int):void
		{
			vars[varNumber] = variable;
			registers[varNumber] = reg;
			values[varNumber] = "";
			varNumber++;
		}
		
		public function addVal(variable:String, value:String):void 
		{
			vars[varNumber] = variable;
			registers[varNumber] = -1;
			values[varNumber] = value;
			varNumber++;
		}
		
		public function findVar(variable:String):Array
		//возвращает информацию о том что содержит переменная, если она существует. Иначе возвращает [-1,"",-1].
		{
			for (var i:int = 0; i < varNumber; i++)
			{
				if (vars[i] == variable)
				{
					if(registers[i] != -1)
						return [1, registers[i], values[i]];
					else
						return [2, registers[i], values[i]];
				}
			}
			return [-1,-1, ""];
		}
	}

}