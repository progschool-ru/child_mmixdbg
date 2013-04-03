var ERROR_TYPE_LEXEM = 0;
var ERROR_TYPE_SYNTAX = 1;
var ERROR_TYPE_SEMANTIC = 2;

var errorTypeStr = [];
errorTypeStr[ERROR_TYPE_LEXEM] = "LEXEM";
errorTypeStr[ERROR_TYPE_SYNTAX] = "SYNTAX";
errorTypeStr[ERROR_TYPE_SEMANTIC] = "SEMANTIC";

function errorQueue() {
	this.length = 0;
	this.queue = [];

	this.isEmpty = function() {
		return (this.length == 0);
	}

	/*
	  error.type :: int - тип ошибки (synt, semantic, ...)
	  error.description :: string - описание
	  error.line :: string - строчка с ошибкой
	  error.lineNr :: int - номер строчки
	*/
	this.addNewError = function(error) {
		this.queue[this.length++] = error;
	}

	// выкидывает все ошибки. в view будет trycatch для обработки ошибок.
	this.finish = function() {
		for (var i = 0; i < this.length; ++i) {
			throw "[" + errTypeStr[this.queue[i].type] + "] at line `" + this.queue[i].line + "`: " + this.queue[i].description;
		}
	}
}

var mainErrorQueue = new errorQueue();

function makeError(err_type, err_description, err_line, err_lineNr) {
	var error = {
		type: err_type,
		description: err_description,
		line: err_line,
		lineNr: err_lineNr
	};
	mainErrorQueue.addNewError(error);
}

function makeLexemError(descr, line, lineNr) {
	makeError(ERROR_TYPE_LEXEM, descr, line, lineNr);
}

function makeSyntaxError(descr, line, lineNr) {
	makeError(ERROR_TYPE_SYNTAX, descr, line, lineNr);
}

function makeSemanticError(descr, line, lineNr) {
	makeError(ERROR_TYPE_SEMANTIC, descr, line, lineNr);
}

function throwAllErrors() {
	mainErrorQueue.finish();
}