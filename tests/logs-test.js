var logger = require('../lib/nu-log.js');

var obj = {name:'pp', valor: 23};
var arr = [{name:'pp', valor: 23},{apellido:'gggg', edad: 23},9,"texto"];
function test1(){
	logger.Error('Mensaje de Error', obj, arr);
	logger.Info('Mensaje de Informacion', obj, arr);
	logger.Trace('Mesnaje de Traza...', obj, arr);
}

var flgt = true;
var flgf = false;
function test2() {
	logger.Error('Mensaje de Error 1', obj, arr);
	logger.Error(true, 'Mensaje de Error 2', obj, arr);
	logger.Error(false, 'Mensaje de Error 3', obj, arr);
	logger.Error(flgt, 'Mensaje de Error 4', obj, arr);
	logger.Error(flgf, 'Mensaje de Error 5', obj, arr);
}

test2();
