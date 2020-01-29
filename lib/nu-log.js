var winston = require('winston');
var gcfg = require('../configUlises.json');

var logger = new (winston.Logger)({
    transports: [
        new winston.transports.Console({
            colorize: true,
            level: gcfg.Ulises.log2con,
            silent: gcfg.Ulises.log2con == 'none' ? true : false
        }),
        new winston.transports.File({
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

function log(level, caller, argc) {

	var firstArgument = 0;	
	if (argc.length > 1) {
		if (typeof argc[0] === "boolean") {
			if (argc[0]===false)
			{
				return;
			}
			firstArgument = 1;
		}
	}

	var msg = '';
	for (var i=firstArgument; i<argc.length; i++) {
        msg += (JSON.stringify(argc[i]) + ', ');
    }
	logger.log(level, "<" + (caller ? caller.name.toString() : '--') + ">: " + msg);
} 

exports.Configure = function(cfg) {
    // Para la consola.
    logger.transports.console.level = cfg.log2con;
    logger.transports.console.silent = cfg.log2con == 'none' ? true : false;

    // Para el faichero
    logger.transports.file.level = cfg.log2file;
    logger.transports.file.silent = cfg.log2file == 'none' ? true : false;
};

exports.Error = function _Error(){
	log('error', _Error.caller, arguments);
};

exports.Info = function _Info() {
	log('info', _Info.caller, arguments);
};

exports.Trace = function _Trace(){
	log('silly', _Trace.caller, arguments);
};