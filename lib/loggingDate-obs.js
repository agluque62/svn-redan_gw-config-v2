var fs = require('fs');
var loggerFactory = require('winston');
var gcfg = require('../configUlises.json');

/*
logger.remove(logger.transports.Console);
if (gcfg.Ulises.log2con==true) {
	logger.add(logger.transports.Console, { colorize: true, level: 'warn' });
}
if (gcfg.Ulises.log2file==true) {
	logger.add(logger.transports.File, { 
		level: 'silly',
		filename: gcfg.Ulises.logfile_path, 
		maxsize: gcfg.Ulises.logfile_sizefile, 
		maxFiles: gcfg.Ulises.logfile_maxfiles, 
		tailable: true, 
		json: false });
}
*/
var logger = new (loggerFactory.Logger)({
    transports: [
        new loggerFactory.transports.Console({
            colorize: true,
            level: gcfg.Ulises.log2con,
            silent: gcfg.Ulises.log2con == 'none' ? true : false
        }),
        new loggerFactory.transports.File({
            level: gcfg.Ulises.log2file,
            filename: gcfg.Ulises.logfile_path,
            maxsize: gcfg.Ulises.logfile_sizefile,
            maxFiles: gcfg.Ulises.logfile_maxfiles,
            tailable: true,
            json: false,
            silent: gcfg.Ulises.log2file == 'none' ? true : false
        })
    ]
});

exports.Configure = function(cfg) {
    // Para la consola.
    logger.transports.console.level = cfg.log2con;
    logger.transports.console.silent = cfg.log2con == 'none' ? true : false;

    // Para el faichero
    logger.transports.file.level = cfg.log2file;
    logger.transports.file.silent = cfg.log2file == 'none' ? true : false;
};

exports.LoggingSuccess = function LoggingSuccess(message, file) {
    /*
        var d=new Date();
        var iniColorGreen = '\x1b[32m';
        var resetColor = 	'\x1b[0m';
        var pad = '00';
        var padMil = '000';
    
        var dia = pad.substring(0, 2 - d.getDate().toString().length) + d.getDate();
        var mes = pad.substring(0, 2 - ((d.getMonth() + 1).toString().length)) + (d.getMonth() + 1);
        var hora = pad.substring(0, 2 - d.getHours().toString().length) + d.getHours();
        var minutos = pad.substring(0, 2 - d.getMinutes().toString().length) + d.getMinutes();
        var segundos = pad.substring(0, 2 - d.getSeconds().toString().length) + d.getSeconds();
        var miliSeg = padMil.substring(0, 3 - d.getMilliseconds().toString().length) + d.getMilliseconds();
    
    
        var s=iniColorGreen + '[' + dia + '/' + mes + '/' + d.getFullYear() + '  ' + hora + ':' + minutos + ':' + segundos + '.' + miliSeg + '] - ';
        console.log(s + message + resetColor);
    
        if (file != null){
            var dirLog = './logs';
            fs.mkdir(dirLog,function(e){
                fs.writeFile(dirLog +'/' + file + '.json', message, function(err) {
                    if(err) {
                        return console.log(err);
                    }
                }); 		
            });
        }
        */
    message = "<" + arguments.callee.caller.name.toString() + ">: " + message;
    logger.info(message);
};

exports.LoggingDate = function LoggingDate(message, file) {
    /*
        var d=new Date();
        var iniColorGreen = '\x1b[32m';
        var resetColor = 	'\x1b[0m';
        var pad = '00';
        var padMil = '000';
    
        var dia = pad.substring(0, 2 - d.getDate().toString().length) + d.getDate();
        var mes = pad.substring(0, 2 - ((d.getMonth() + 1).toString().length)) + (d.getMonth() + 1);
        var hora = pad.substring(0, 2 - d.getHours().toString().length) + d.getHours();
        var minutos = pad.substring(0, 2 - d.getMinutes().toString().length) + d.getMinutes();
        var segundos = pad.substring(0, 2 - d.getSeconds().toString().length) + d.getSeconds();
        var miliSeg = padMil.substring(0, 3 - d.getMilliseconds().toString().length) + d.getMilliseconds();
    
    
        var s=iniColorGreen + '[' + dia + '/' + mes + '/' + d.getFullYear() + '  ' + hora + ':' + minutos + ':' + segundos + '.' + miliSeg + '] - ' + resetColor;
        console.log(s + message);
    
        if (file != null){
            var dirLog = './logs';
            fs.mkdir(dirLog,function(e){
                fs.writeFile(dirLog +'/' + file + '.json', message, function(err) {
                    if(err) {
                        return console.log(err);
                    }
                }); 		
            });
        }
        */
    message = "<" + arguments.callee.caller.name.toString() + ">: " + message;
    logger.info(message);
};

exports.loggingError = function loggingError(message) {
    /*
        var d=new Date();
        var resetColor = 	'\x1b[0m';
        var iniColorRed = '\x1b[91m';
        var pad = '00';
        var padMil = '000';
    
        var dia = pad.substring(0, 2 - d.getDate().toString().length) + d.getDate();
        var mes = pad.substring(0, 2 - ((d.getMonth() + 1).toString().length)) + (d.getMonth() + 1);
        var hora = pad.substring(0, 2 - d.getHours().toString().length) + d.getHours();
        var minutos = pad.substring(0, 2 - d.getMinutes().toString().length) + d.getMinutes();
        var segundos = pad.substring(0, 2 - d.getSeconds().toString().length) + d.getSeconds();
        var miliSeg = padMil.substring(0, 3 - d.getMilliseconds().toString().length) + d.getMilliseconds();
    
    
        var s=iniColorRed + '[' + dia + '/' + mes + '/' + d.getFullYear() + '  ' + hora + ':' + minutos + ':' + segundos + '.' + miliSeg + '] - ' + message + resetColor;
        console.log(s);
        */
    message = "<" + arguments.callee.caller.name.toString() + ">: " + message;
    logger.error(message);
};

/** AGL. **/
exports.LoggingSuccessCond = function LoggingSuccessCond(message, cond) {
    if (cond == true) {
        //		exports.LoggingSuccess(message, file);
        message = "<" + arguments.callee.caller.name.toString() + ">: " + message;
        logger.info(message);
    }
};
exports.LoggingDateCond = function LoggingDateCond(message, cond) {
    if (cond == true) {
        //		exports.LoggingDate(message, file);
        message = "<" + arguments.callee.caller.name.toString() + ">: " + message;
        logger.info(message);
    }
};
exports.LoggingErrorCond = function LoggingErrorCond(message, cond) {
    if (cond == true) {
        //		exports.LoggingError(message);
        message = "<" + arguments.callee.caller.name.toString() + ">: " + message;
        logger.error(message);
    }
};
