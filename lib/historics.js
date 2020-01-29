var async = require('async');
var logging = require('./nu-log.js');

/** AGL */
var gcfg = require('../configUlises.json');
var ug5kdb = require('./ug5kdb.js');

if (!global.LastId) global.LastId = -1;

/****************************/
/*	FUNCTION: getHistorics 	*/
/*  PARAMS: 				*/
/****************************/
exports.getHistorics = function getHistorics(f) {
    var query = 'SELECT H.IdHistoricoIncidencias, H.IdHw,H.TipoHw,H.IdIncidencia,DATE_FORMAT(H.FechaHora, "%d/%m/%Y %H:%i:%s") as FechaHora,' +
        'DATE_FORMAT(H.Reconocida, "%d/%m/%Y %H:%i:%s") as Reconocida,H.Descripcion,H.Usuario,I.LineaEventos as Alarma, I.Nivel as TipoAlarma ' +
        'FROM historicoincidencias H, Incidencias I WHERE H.IdIncidencia=I.IdIncidencia ORDER BY -FechaHora ' +
        'LIMIT 1000';
    var param = null;
    ug5kdb.Query(query, param, function(err, rows) {
        var resultado = {
            error: null,
            howMany: !err ? rows.length : null,
            historics: !err ? rows : null
        };
        /** Recuerda el Primer Elemento de la Pagina */
        if (resultado.historics != null && resultado.historics.length != 0)
            global.LastId = resultado.historics[0].IdHistoricoIncidencias;

        if (f) f(resultado);
    }, true); // Para no hacer log del resultado de la consulta.
};
///
exports.getHistorics_v1 = function getHistorics_v1(f) {
    var mySql = require('mySql');
    var connection = ug5kdb.GetDbConnection();/* mySql.createConnection({
        host: gcfg.Ulises.dbhost,
        user: gcfg.Ulises.dbuser,
        password: gcfg.Ulises.dbpassword,
        database: gcfg.Ulises.dbdatabase
    });*/

    connection.connect(function(err) {
        if (err) {
            logging.Error("Error connection to 'U5K-G' database.");
        }
        else {
            

            var query = connection.query('SELECT H.IdHw,H.TipoHw,H.IdIncidencia,DATE_FORMAT(H.FechaHora, "%d/%m/%Y %H:%i:%s") as FechaHora,' +
                'DATE_FORMAT(H.Reconocida, "%d/%m/%Y %H:%i:%s") as Reconocida,H.Descripcion,H.Usuario,I.LineaEventos as Alarma, I.Nivel as TipoAlarma ' +
                'FROM historicoincidencias H, Incidencias I WHERE H.IdIncidencia=I.IdIncidencia ORDER BY -FechaHora ' +
                'LIMIT 1000', function(err, rows, fields) {

                    /** 20170508. Encontrar '0' registros no se debe considerar ERROR */
                    // if (err || rows.length == 0){
                    // 	connection.end();	
                    // 	return f(err ? err : 'NO_DATA');
                    // }

                    // connection.end();	
                    // logging.Trace(query.sql);
                    // f({error: err, howMany: rows.length, historics: rows});
                    connection.end();
                    if (err) {
                        f(err);
                    }
                    else {
                        logging.Trace(query.sql);
                        f({ error: err, howMany: rows.length, historics: rows });
                    }

                });
        }
    });
};

/************************************/
/*	FUNCTION: getHistoricsEvents 	*/
/*  PARAMS: 				        */
/************************************/
exports.getHistoricsEvents = function getHistoricsEvents(f) {

    var query = 'SELECT H.IdHistoricoIncidencias, H.IdHw,H.TipoHw,H.IdIncidencia,DATE_FORMAT(H.FechaHora, "%d/%m/%Y %H:%i:%s") as FechaHora,' +
        'DATE_FORMAT(H.Reconocida, "%d/%m/%Y %H:%i:%s") as Reconocida,H.Descripcion,H.Usuario ' +
        'FROM historicoincidencias H, Incidencias I WHERE H.IdIncidencia=I.IdIncidencia AND I.LineaEventos=0 ORDER BY -FechaHora ' +
        'LIMIT 1000';
    var param = null;
    ug5kdb.Query(query, param, function(err, rows) {
        var resultado = {
            error: null,
            howMany: !err ? rows.length : null,
            historics: !err ? rows : null
        };
        /** Recuerda el Primer Elemento de la Pagina */
        if (resultado.historics != null && resultado.historics.length != 0)
            global.LastId = resultado.historics[0].IdHistoricoIncidencias;

        if (f) f(resultado);
    }, true); // Para no hacer log del resultado de la consulta.
};

exports.getHistoricsEvents_v1 = function getHistoricsEvents_v1(f) {
    var mySql = require('mySql');
    var connection = ug5kdb.GetDbConnection();/* mySql.createConnection({
        host: gcfg.Ulises.dbhost,
        user: gcfg.Ulises.dbuser,
        password: gcfg.Ulises.dbpassword,
        database: gcfg.Ulises.dbdatabase
    });*/

    connection.connect(function(err) {
        if (err) {
            logging.Error("Error connection to 'U5K-G' database.");
        }
        else {
            

            var query = connection.query('SELECT H.IdHw,H.TipoHw,H.IdIncidencia,DATE_FORMAT(H.FechaHora, "%d/%m/%Y %H:%i:%s") as FechaHora,' +
                'DATE_FORMAT(H.Reconocida, "%d/%m/%Y %H:%i:%s") as Reconocida,H.Descripcion,H.Usuario ' +
                'FROM historicoincidencias H, Incidencias I WHERE H.IdIncidencia=I.IdIncidencia AND I.LineaEventos=0 ORDER BY -FechaHora ' +
                'LIMIT 1000', function(err, rows, fields) {

                    /** 20170508. Encontrar '0' registros no se debe considerar ERROR */
                    // if (err || rows.length == 0){
                    // 	connection.end();	
                    // 	return f(err ? err : 'NO_DATA');
                    // }

                    // connection.end();	
                    // logging.Trace(query.sql);
                    // f({error: err, howMany: rows.length, historics: rows});
                    connection.end();
                    if (err) {
                        f(err);
                    }
                    else {
                        logging.Trace(query.sql);
                        f({ error: err, howMany: rows.length, historics: rows });
                    }

                });
        }
    });
};

/************************************/
/*	FUNCTION: getHistoricsAlarms 	*/
/*  PARAMS: 				        */
/************************************/
exports.getHistoricsAlarms = function getHistoricsAlarms(f) {
    var query = 'SELECT H.IdHistoricoIncidencias, H.IdHw,H.TipoHw,H.IdIncidencia,DATE_FORMAT(H.FechaHora, "%d/%m/%Y %H:%i:%s") as FechaHora,' +
        'DATE_FORMAT(H.Reconocida, "%d/%m/%Y %H:%i:%s") as Reconocida,H.Descripcion,H.Usuario,I.LineaEventos as Alarma, I.Nivel as TipoAlarma ' +
        'FROM historicoincidencias H, Incidencias I WHERE H.IdIncidencia=I.IdIncidencia AND I.LineaEventos=1 ORDER BY -FechaHora ' +
        'LIMIT 1000';
    var param = null;
    ug5kdb.Query(query, param, function(err, rows) {
        var resultado = {
            error: null,
            howMany: !err ? rows.length : null,
            historics: !err ? rows : null
        };
        /** Recuerda el Primer Elemento de la Pagina */
        if (resultado.historics != null && resultado.historics.length != 0)
            global.LastId = resultado.historics[0].IdHistoricoIncidencias;

        if (f) f(resultado);
    }, true); // Para no hacer log del resultado de la consulta.
};

exports.getHistoricsAlarms_v1 = function getHistoricsAlarms_v1(f) {
    var mySql = require('mySql');
    var connection = ug5kdb.GetDbConnection();/* mySql.createConnection({
        host: gcfg.Ulises.dbhost,
        user: gcfg.Ulises.dbuser,
        password: gcfg.Ulises.dbpassword,
        database: gcfg.Ulises.dbdatabase
    });*/

    connection.connect(function(err) {
        if (err) {
            logging.Error("Error connection to 'U5K-G' database.");
        }
        else {
            

            var query = connection.query('SELECT H.IdHw,H.TipoHw,H.IdIncidencia,DATE_FORMAT(H.FechaHora, "%d/%m/%Y %H:%i:%s") as FechaHora,' +
                'DATE_FORMAT(H.Reconocida, "%d/%m/%Y %H:%i:%s") as Reconocida,H.Descripcion,H.Usuario,I.LineaEventos as Alarma, I.Nivel as TipoAlarma ' +
                'FROM historicoincidencias H, Incidencias I WHERE H.IdIncidencia=I.IdIncidencia AND I.LineaEventos=1 ORDER BY -FechaHora ' +
                'LIMIT 1000', function(err, rows, fields) {

                    /** 20170508. Encontrar '0' registros no se debe considerar ERROR */
                    // if (err || rows.length == 0){
                    // 	connection.end();	
                    // 	return f(err ? err : 'NO_DATA');
                    // }

                    // connection.end();	
                    // logging.Trace(query.sql);
                    // f({error: err, howMany: rows.length, historics: rows});
                    connection.end();
                    if (err) {
                        f(err);
                    }
                    else {
                        logging.Trace(query.sql);
                        f({ error: err, howMany: rows.length, historics: rows });
                    }
                });
        }
    });
};

/************************************/
/*	FUNCTION: getHistoricsByGroup 	*/
/*  PARAMS: 				        */
/************************************/
exports.getHistoricsByGroup = function getHistoricsByGroup(data, f) {
    var firstQuery = parseInt(data.start) == 0 && parseInt(data.howMany) == 0;
    var limit = firstQuery ? "1000" : data.start.toString() + ',' + data.howMany.toString();
    var lastIdFilter = firstQuery ? '' : 'AND h.IdHistoricoIncidencias <= ' + global.LastId.toString() + ' ';
    var query = 'SELECT H.IdHistoricoIncidencias, h.IdHw,h.TipoHw,h.IdIncidencia,DATE_FORMAT(h.FechaHora, "%d/%m/%Y %H:%i:%s") as FechaHora,' +
        'DATE_FORMAT(h.Reconocida, "%d/%m/%Y %H:%i:%s") as Reconocida,h.Descripcion,h.Usuario,I.LineaEventos as Alarma, I.Nivel as TipoAlarma ' +
        'FROM historicoincidencias h,Incidencias I ' +
        'WHERE H.IdIncidencia=I.IdIncidencia AND h.TipoHw=\'' + data.code + '\'' +
        ' AND h.FechaHora>=\'' + data.startDate + '\' AND h.FechaHora<=\'' + data.endDate + '\' ' +
        lastIdFilter +
        ' ORDER BY -h.FechaHora ' +
        'LIMIT ' + limit;
    var param = null;
    ug5kdb.Query(query, param, function(err, rows) {
        var resultado = {
            error: null,
            howMany: !err ? rows.length : null,
            historics: !err ? rows : null
        };
        /** Recuerda el Primer Elemento de la Pagina */
        if (firstQuery && resultado.historics != null && resultado.historics.length != 0)
            global.LastId = resultado.historics[0].IdHistoricoIncidencias;

        if (f) f(resultado);
    }, true); // Para no hacer log del resultado de la consulta.
};

exports.getHistoricsByGroup_v1 = function getHistoricsByGroup_v1(data, f) {
    var mySql = require('mySql');
    var connection = ug5kdb.GetDbConnection();/* mySql.createConnection({
        host: gcfg.Ulises.dbhost,
        user: gcfg.Ulises.dbuser,
        password: gcfg.Ulises.dbpassword,
        database: gcfg.Ulises.dbdatabase
    });*/

    connection.connect(function(err) {
        if (err) {
            logging.Error("Error connection to 'U5K-G' database.");
        }
        else {
            

            var strQuery = '';
            if (parseInt(data.start) != 0 || parseInt(data.howMany) != 0)
                strQuery = 'SELECT h.IdHw,h.TipoHw,h.IdIncidencia,DATE_FORMAT(h.FechaHora, "%d/%m/%Y %H:%i:%s") as FechaHora,' +
                    'DATE_FORMAT(h.Reconocida, "%d/%m/%Y %H:%i:%s") as Reconocida,h.Descripcion,h.Usuario,I.LineaEventos as Alarma, I.Nivel as TipoAlarma ' +
                    ' FROM historicoincidencias h,Incidencias I WHERE H.IdIncidencia=I.IdIncidencia AND h.TipoHw=\'' + data.code + '\'' +
                    ' AND h.FechaHora>=\'' + data.startDate + '\' AND h.FechaHora<=\'' + data.endDate + '\' ' +
                    ' ORDER BY -h.FechaHora ' +
                    'LIMIT ' + parseInt(data.start) + ',' + parseInt(data.howMany);
            else
                strQuery = 'SELECT h.IdHw,h.TipoHw,h.IdIncidencia,DATE_FORMAT(h.FechaHora, "%d/%m/%Y %H:%i:%s") as FechaHora,' +
                    'DATE_FORMAT(h.Reconocida, "%d/%m/%Y %H:%i:%s") as Reconocida,h.Descripcion,h.Usuario,I.LineaEventos as Alarma, I.Nivel as TipoAlarma ' +
                    ' FROM historicoincidencias h,Incidencias I WHERE H.IdIncidencia=I.IdIncidencia AND TipoHw=\'' + data.code + '\'' +
                    ' AND h.FechaHora>=\'' + data.startDate + '\' AND h.FechaHora<=\'' + data.endDate + '\' ' +
                    ' ORDER BY -h.FechaHora LIMIT 1000';

            var query = connection.query(strQuery, function(err, rows, fields) {

                /** 20170508. Encontrar '0' registros no se debe considerar ERROR */
                // if (err || rows.length == 0){
                // 	logging.Trace(query.sql);
                // 	connection.end();	
                // 	return f(err ? err : 'NO_DATA');
                // }
                // connection.end();	
                // logging.Trace(query.sql);
                // f({error: err, howMany: rows.length, historics: rows});
                connection.end();
                if (err) {
                    f(err);
                }
                else {
                    logging.Trace(query.sql);
                    f({ error: err, howMany: rows.length, historics: rows });
                }

            });
        }
    });
};

/**************************************/
/*	FUNCTION: getHistoricsByComponent */
/*  PARAMS: 				          */
/**************************************/
exports.getHistoricsByComponent = function getHistoricsByComponent(data, f) {
    var firstQuery = parseInt(data.start) == 0 && parseInt(data.howMany) == 0;
    var limit = firstQuery ? "1000" : data.start.toString() + ',' + data.howMany.toString();
    var lastIdFilter = firstQuery ? '' : 'AND h.IdHistoricoIncidencias <= ' + global.LastId.toString() + ' ';
    var query = 'SELECT H.IdHistoricoIncidencias, h.IdHw,h.TipoHw,h.IdIncidencia,DATE_FORMAT(h.FechaHora, "%d/%m/%Y %H:%i:%s") as FechaHora,' +
        'DATE_FORMAT(h.Reconocida, "%d/%m/%Y %H:%i:%s") as Reconocida,h.Descripcion,h.Usuario,I.LineaEventos as Alarma, I.Nivel as TipoAlarma ' +
        'FROM historicoincidencias h,Incidencias I ' +
        'WHERE H.IdIncidencia=I.IdIncidencia AND h.IdHw=\'' + data.code + '\'' +
        ' AND h.FechaHora>=\'' + data.startDate + '\' AND h.FechaHora<=\'' + data.endDate + '\' ' +
        lastIdFilter +
        ' ORDER BY -h.FechaHora LIMIT ' + limit;
    var param = null;
    ug5kdb.Query(query, param, function(err, rows) {
        var resultado = {
            error: null,
            howMany: !err ? rows.length : null,
            historics: !err ? rows : null
        };
        /** Recuerda el Primer Elemento de la Pagina */
        if (firstQuery && resultado.historics != null && resultado.historics.length != 0)
            global.LastId = resultado.historics[0].IdHistoricoIncidencias;

        if (f) f(resultado);
    }, true); // Para no hacer log del resultado de la consulta.
};

exports.getHistoricsByComponent_v1 = function getHistoricsByComponent_v1(data, f) {
    var mySql = require('mySql');
    var connection = ug5kdb.GetDbConnection();/* mySql.createConnection({
        host: gcfg.Ulises.dbhost,
        user: gcfg.Ulises.dbuser,
        password: gcfg.Ulises.dbpassword,
        database: gcfg.Ulises.dbdatabase
    });*/

    connection.connect(function(err) {
        if (err) {
            logging.Error("Error connection to 'U5K-G' database.");
        }
        else {
            

            var strQuery = '';
            if (parseInt(data.start) != 0 || parseInt(data.howMany) != 0)
                strQuery = 'SELECT h.IdHw,h.TipoHw,h.IdIncidencia,DATE_FORMAT(h.FechaHora, "%d/%m/%Y %H:%i:%s") as FechaHora,' +
                    'DATE_FORMAT(h.Reconocida, "%d/%m/%Y %H:%i:%s") as Reconocida,h.Descripcion,h.Usuario,I.LineaEventos as Alarma, I.Nivel as TipoAlarma ' +
                    ' FROM historicoincidencias h ,Incidencias I WHERE H.IdIncidencia=I.IdIncidencia AND h.IdHw=\'' + data.code + '\'' +
                    ' AND h.FechaHora>=\'' + data.startDate + '\' AND h.FechaHora<=\'' + data.endDate + '\' ' +
                    ' ORDER BY -h.FechaHora ' +
                    'LIMIT ' + parseInt(data.start) + ',' + parseInt(data.howMany);
            else
                strQuery = 'SELECT h.IdHw,h.TipoHw,h.IdIncidencia,DATE_FORMAT(h.FechaHora, "%d/%m/%Y %H:%i:%s") as FechaHora,' +
                    'DATE_FORMAT(h.Reconocida, "%d/%m/%Y %H:%i:%s") as Reconocida,h.Descripcion,h.Usuario,I.LineaEventos as Alarma, I.Nivel as TipoAlarma ' +
                    ' FROM historicoincidencias h,Incidencias I WHERE H.IdIncidencia=I.IdIncidencia AND h.IdHw=\'' + data.code + '\'' +
                    ' AND h.FechaHora>=\'' + data.startDate + '\' AND h.FechaHora<=\'' + data.endDate + '\' ' +
                    ' ORDER BY -h.FechaHora LIMIT 1000';

            var query = connection.query(strQuery, function(err, rows, fields) {
                /** 20170508. Encontrar '0' registros no se debe considerar ERROR */
                // if (err || rows.length == 0){
                // 	logging.Trace(query.sql);
                // 	connection.end();	
                // 	return f(err ? err : 'NO_DATA');
                // }

                // connection.end();	
                // logging.Trace(query.sql);
                // f({error: err, howMany: rows.length, historics: rows});
                connection.end();
                if (err) {
                    f(err);
                }
                else {
                    logging.Trace(query.sql);
                    f({ error: err, howMany: rows.length, historics: rows });
                }
            });
        }
    });
};

/************************************/
/*	FUNCTION: getHistoricsByCode 	*/
/*  PARAMS: 				        */
/************************************/
exports.getHistoricsByCode = function getHistoricsByCode(data, f) {
    var firstQuery = parseInt(data.start) == 0 && parseInt(data.howMany) == 0;
    var limit = firstQuery ? "1000" : data.start.toString() + ',' + data.howMany.toString();
    var lastIdFilter = firstQuery ? '' : 'AND h.IdHistoricoIncidencias <= ' + global.LastId.toString() + ' ';
    var query = 'SELECT H.IdHistoricoIncidencias, h.IdHw,h.TipoHw,h.IdIncidencia,DATE_FORMAT(h.FechaHora, "%d/%m/%Y %H:%i:%s") as FechaHora,' +
        'DATE_FORMAT(h.Reconocida, "%d/%m/%Y %H:%i:%s") as Reconocida,h.Descripcion,h.Usuario ' +
        'FROM historicoincidencias h,Incidencias I ' +
        'WHERE H.IdIncidencia=I.IdIncidencia AND h.IdIncidencia=\'' + data.code + '\'' +
        ' AND h.FechaHora>=\'' + data.startDate + '\' AND h.FechaHora<=\'' + data.endDate + '\' ' +
        lastIdFilter +
        ' ORDER BY -h.FechaHora LIMIT ' + limit;
    var param = null;
    ug5kdb.Query(query, param, function(err, rows) {
        var resultado = {
            error: null,
            howMany: !err ? rows.length : null,
            historics: !err ? rows : null
        };
        /** Recuerda el Primer Elemento de la Pagina */
        if (firstQuery && resultado.historics != null && resultado.historics.length != 0)
            global.LastId = resultado.historics[0].IdHistoricoIncidencias;

        if (f) f(resultado);
    }, true); // Para no hacer log del resultado de la consulta.
};

exports.getHistoricsByCode_v1 = function getHistoricsByCode_v1(data, f) {
    var mySql = require('mySql');
    var connection = ug5kdb.GetDbConnection();/* mySql.createConnection({
        host: gcfg.Ulises.dbhost,
        user: gcfg.Ulises.dbuser,
        password: gcfg.Ulises.dbpassword,
        database: gcfg.Ulises.dbdatabase
    });*/

    connection.connect(function(err) {
        if (err) {
            logging.Error("Error connection to 'U5K-G' database.");
        }
        else {
            

            var strQuery = '';
            if (parseInt(data.start) != 0 || parseInt(data.howMany) != 0)
                strQuery = 'SELECT h.IdHw,h.TipoHw,h.IdIncidencia,DATE_FORMAT(h.FechaHora, "%d/%m/%Y %H:%i:%s") as FechaHora,' +
                    'DATE_FORMAT(h.Reconocida, "%d/%m/%Y %H:%i:%s") as Reconocida,h.Descripcion,h.Usuario ' +
                    ' FROM historicoincidencias h,Incidencias I WHERE H.IdIncidencia=I.IdIncidencia AND h.IdIncidencia=\'' + data.code + '\'' +
                    ' AND h.FechaHora>=\'' + data.startDate + '\' AND h.FechaHora<=\'' + data.endDate + '\' ' +
                    ' ORDER BY -h.FechaHora' +
                    ' LIMIT ' + parseInt(data.start) + ',' + parseInt(data.howMany);
            else
                strQuery = 'SELECT h.IdHw,h.TipoHw,h.IdIncidencia,DATE_FORMAT(h.FechaHora, "%d/%m/%Y %H:%i:%s") as FechaHora,' +
                    'DATE_FORMAT(h.Reconocida, "%d/%m/%Y %H:%i:%s") as Reconocida,h.Descripcion,h.Usuario ' +
                    ' FROM historicoincidencias h,Incidencias I WHERE H.IdIncidencia=I.IdIncidencia AND h.IdIncidencia=\'' + data.code + '\'' +
                    ' AND h.FechaHora>=\'' + data.startDate + '\' AND h.FechaHora<=\'' + data.endDate + '\' ' +
                    ' ORDER BY -h.FechaHora LIMIT 1000';

            var query = connection.query(strQuery, function(err, rows, fields) {
                /** 20170508. Encontrar '0' registros no se debe considerar ERROR */
                // if (err || rows.length == 0){
                // 	logging.Trace(query.sql);
                // 	connection.end();	
                // 	return f(err ? err : 'NO_DATA');
                // }

                // connection.end();	
                // logging.Trace(query.sql);
                // f({error: err, howMany: rows.length, historics: rows});
                connection.end();
                if (err) {
                    f(err);
                }
                else {
                    logging.Trace(query.sql);
                    f({ error: err, howMany: rows.length, historics: rows });
                }
            });
        }
    });
};

/************************************/
/*	FUNCTION: getHistoricsRange 	*/
/*  PARAMS: 				        */
/************************************/
exports.getHistoricsRange = function getHistoricsRange(start, howMany, f) {

    var lastIdFilter = 'AND h.IdHistoricoIncidencias <= ' + global.LastId.toString() + ' ';
    var query = 'SELECT h.IdHw,h.TipoHw,h.IdIncidencia,DATE_FORMAT(h.FechaHora, "%d/%m/%Y %H:%i:%s") as FechaHora,' +
        'DATE_FORMAT(h.Reconocida, "%d/%m/%Y %H:%i:%s") as Reconocida,h.Descripcion,h.Usuario,I.LineaEventos as Alarma, I.Nivel as TipoAlarma ' +
        'FROM historicoincidencias h, Incidencias I ' +
        'WHERE h.IdIncidencia=I.IdIncidencia ' + lastIdFilter +
        'ORDER BY -FechaHora LIMIT ?,?';
    var param = [parseInt(start), parseInt(howMany)];
    ug5kdb.Query(query, param, function(err, rows) {
        var resultado = {
            error: null,
            howMany: !err ? rows.length : null,
            historics: !err ? rows : null
        };
        if (f) f(resultado);
    }, true); // Para no hacer log del resultado de la consulta.
};
//
exports.getHistoricsRange_v1 = function getHistoricsRange_v1(start, howMany, f) {
    var mySql = require('mySql');
    var connection = ug5kdb.GetDbConnection();/* mySql.createConnection({
        host: gcfg.Ulises.dbhost,
        user: gcfg.Ulises.dbuser,
        password: gcfg.Ulises.dbpassword,
        database: gcfg.Ulises.dbdatabase
    });*/

    connection.connect(function(err) {
        if (err) {
            logging.Error("Error connection to 'U5K-G' database.");
        }
        else {
            

            var query = connection.query('SELECT h.IdHw,h.TipoHw,h.IdIncidencia,DATE_FORMAT(h.FechaHora, "%d/%m/%Y %H:%i:%s") as FechaHora,' +
                'DATE_FORMAT(h.Reconocida, "%d/%m/%Y %H:%i:%s") as Reconocida,h.Descripcion,h.Usuario,I.LineaEventos as Alarma, I.Nivel as TipoAlarma ' +
                'FROM historicoincidencias h, Incidencias I WHERE h.IdIncidencia=I.IdIncidencia ORDER BY -FechaHora LIMIT ?,?', [parseInt(start), parseInt(howMany)], function(err, rows, fields) {

                    /** 20170508. Encontrar '0' registros no se debe considerar ERROR */
                    // if (err || rows.length == 0){
                    // 	logging.Trace(query.sql);
                    // 	connection.end();	
                    // 	return f(err ? err : 'NO_DATA');
                    // }

                    // connection.end();	
                    // logging.Trace(query.sql);
                    // f({error: err, howMany: rows.length, historics: rows});
                    connection.end();
                    if (err) {
                        f(err);
                    }
                    else {
                        logging.Trace(query.sql);
                        f({ error: err, howMany: rows.length, historics: rows });
                    }

                });
        }
    });
};
/**************************************/
/*	FUNCTION: getHistoricsRangeEvents */
/*  PARAMS: 				          */
/**************************************/
exports.getHistoricsRangeEvents = function getHistoricsRangeEvents(start, howMany, f) {
    var lastIdFilter = 'AND h.IdHistoricoIncidencias <= ' + global.LastId.toString() + ' ';
    var query = 'SELECT h.IdHw,h.TipoHw,h.IdIncidencia,DATE_FORMAT(h.FechaHora, "%d/%m/%Y %H:%i:%s") as FechaHora,' +
        'DATE_FORMAT(h.Reconocida, "%d/%m/%Y %H:%i:%s") as Reconocida,h.Descripcion,h.Usuario ' +
        'FROM historicoincidencias h, Incidencias I ' +
        'WHERE h.IdIncidencia=I.IdIncidencia AND I.LineaEventos= 0 ' + lastIdFilter +
        'ORDER BY -FechaHora LIMIT ?,?';
    var param = [parseInt(start), parseInt(howMany)];
    ug5kdb.Query(query, param, function(err, rows) {
        var resultado = {
            error: null,
            howMany: !err ? rows.length : null,
            historics: !err ? rows : null
        };
        if (f) f(resultado);
    }, true); // Para no hacer log del resultado de la consulta.
};

exports.getHistoricsRangeEvents_v1 = function getHistoricsRangeEvents_v1(start, howMany, f) {
    var mySql = require('mySql');
    var connection = ug5kdb.GetDbConnection();/* mySql.createConnection({
        host: gcfg.Ulises.dbhost,
        user: gcfg.Ulises.dbuser,
        password: gcfg.Ulises.dbpassword,
        database: gcfg.Ulises.dbdatabase
    });*/

    connection.connect(function(err) {
        if (err) {
            logging.Error("Error connection to 'U5K-G' database.");
        }
        else {
            

            var query = connection.query('SELECT h.IdHw,h.TipoHw,h.IdIncidencia,DATE_FORMAT(h.FechaHora, "%d/%m/%Y %H:%i:%s") as FechaHora,' +
                'DATE_FORMAT(h.Reconocida, "%d/%m/%Y %H:%i:%s") as Reconocida,h.Descripcion,h.Usuario ' +
                'FROM historicoincidencias h, Incidencias I WHERE h.IdIncidencia=I.IdIncidencia AND I.LineaEventos= 0 ORDER BY -FechaHora LIMIT ?,?',
                [parseInt(start), parseInt(howMany)], function(err, rows, fields) {

                    /** 20170508. Encontrar '0' registros no se debe considerar ERROR */
                    // if (err || rows.length == 0){
                    // 	logging.Trace(query.sql);
                    // 	connection.end();	
                    // 	return f(err ? err : 'NO_DATA');
                    // }

                    // connection.end();	
                    // logging.Trace(query.sql);
                    // f({error: err, howMany: rows.length, historics: rows});
                    connection.end();
                    if (err) {
                        f(err);
                    }
                    else {
                        logging.Trace(query.sql);
                        f({ error: err, howMany: rows.length, historics: rows });
                    }

                });
        }
    });
};

/****************************************/
/*	FUNCTION: getHistoricsRangeAlarms 	*/
/*  PARAMS: 				            */
/****************************************/
exports.getHistoricsRangeAlarms = function getHistoricsRangeAlarms(start, howMany, f) {
    var lastIdFilter = 'AND h.IdHistoricoIncidencias <= ' + global.LastId.toString() + ' ';
    var query = 'SELECT h.IdHw,h.TipoHw,h.IdIncidencia,DATE_FORMAT(h.FechaHora, "%d/%m/%Y %H:%i:%s") as FechaHora,' +
        'DATE_FORMAT(h.Reconocida, "%d/%m/%Y %H:%i:%s") as Reconocida,h.Descripcion,h.Usuario,I.LineaEventos as Alarma, I.Nivel as TipoAlarma ' +
        'FROM historicoincidencias h, Incidencias I ' +
        'WHERE h.IdIncidencia=I.IdIncidencia AND I.LineaEventos=1 ' + lastIdFilter +
        'ORDER BY -FechaHora LIMIT ?,?';
    var param = [parseInt(start), parseInt(howMany)];
    ug5kdb.Query(query, param, function(err, rows) {
        var resultado = {
            error: null,
            howMany: !err ? rows.length : null,
            historics: !err ? rows : null
        };
        if (f) f(resultado);
    }, true); // Para no hacer log del resultado de la consulta.
};

exports.getHistoricsRangeAlarms_v1 = function getHistoricsRangeAlarms_v1(start, howMany, f) {
    var mySql = require('mySql');
    var connection = ug5kdb.GetDbConnection();/* mySql.createConnection({
        host: gcfg.Ulises.dbhost,
        user: gcfg.Ulises.dbuser,
        password: gcfg.Ulises.dbpassword,
        database: gcfg.Ulises.dbdatabase
    });*/

    connection.connect(function(err) {
        if (err) {
            logging.Error("Error connection to 'U5K-G' database.");
        }
        else {
            

            var query = connection.query('SELECT h.IdHw,h.TipoHw,h.IdIncidencia,DATE_FORMAT(h.FechaHora, "%d/%m/%Y %H:%i:%s") as FechaHora,' +
                'DATE_FORMAT(h.Reconocida, "%d/%m/%Y %H:%i:%s") as Reconocida,h.Descripcion,h.Usuario,I.LineaEventos as Alarma, I.Nivel as TipoAlarma ' +
                'FROM historicoincidencias h, Incidencias I WHERE h.IdIncidencia=I.IdIncidencia AND I.LineaEventos=1 ORDER BY -FechaHora LIMIT ?,?', [parseInt(start), parseInt(howMany)], function(err, rows, fields) {

                    /** 20170508. Encontrar '0' registros no se debe considerar ERROR */
                    // if (err || rows.length == 0){
                    // 	logging.Trace(query.sql);
                    // 	connection.end();	
                    // 	return f(err ? err : 'NO_DATA');
                    // }

                    // connection.end();	
                    // logging.Trace(query.sql);
                    // f({error: err, howMany: rows.length, historics: rows});
                    connection.end();
                    if (err) {
                        f(err);
                    }
                    else {
                        logging.Trace(query.sql);
                        f({ error: err, howMany: rows.length, historics: rows });
                    }
                });
        }
    });
};

/*************************************/
/*	FUNCTION: getHistoricsByDateTime */
/*  PARAMS: 				         */
/*************************************/
exports.getHistoricsByDatetime = function getHistoricsByDatetime(startTime, endTime, start, howMany, f) {
    var firstQuery = parseInt(start) == 0 && parseInt(howMany) == 0;
    var limit = firstQuery ? "1000" : start.toString() + ',' + howMany.toString();
    var lastIdFilter = firstQuery ? '' : 'AND h.IdHistoricoIncidencias <= ' + global.LastId.toString() + ' ';
    var query = 'SELECT H.IdHistoricoIncidencias, h.IdHw,h.TipoHw,h.IdIncidencia,DATE_FORMAT(h.FechaHora, "%d/%m/%Y %H:%i:%s") as FechaHora,' +
        'DATE_FORMAT(h.Reconocida, "%d/%m/%Y %H:%i:%s") as Reconocida,h.Descripcion,h.Usuario,I.LineaEventos as Alarma, I.Nivel as TipoAlarma ' +
        'FROM historicoincidencias h ,Incidencias I ' +
        'WHERE H.IdIncidencia=I.IdIncidencia AND h.FechaHora>=\'' + startTime + '\' AND h.FechaHora<=\'' + endTime + '\'  ' + lastIdFilter +
        'ORDER BY -h.FechaHora LIMIT ' + limit;
    var param = null;
    ug5kdb.Query(query, param, function(err, rows) {
        var resultado = {
            error: null,
            howMany: !err ? rows.length : null,
            historics: !err ? rows : null
        };
        /** Recuerda el Primer Elemento de la Pagina */
        if (firstQuery && resultado.historics != null && resultado.historics.length != 0)
            global.LastId = resultado.historics[0].IdHistoricoIncidencias;

        if (f) f(resultado);
    }, true); // Para no hacer log del resultado de la consulta.
};
///
exports.getHistoricsByDatetime_v1 = function getHistoricsByDatetime_v1(startTime, endTime, start, howMany, f) {
    var mySql = require('mySql');
    var connection = ug5kdb.GetDbConnection();/* mySql.createConnection({
        host: gcfg.Ulises.dbhost,
        user: gcfg.Ulises.dbuser,
        password: gcfg.Ulises.dbpassword,
        database: gcfg.Ulises.dbdatabase
    });*/

    connection.connect(function(err) {
        if (err) {
            logging.Error("Error connection to 'U5K-G' database.");
        }
        else {
            

            var queryString = '';
            if (parseInt(start) != 0 || parseInt(howMany) != 0)
                queryString = 'SELECT h.IdHw,h.TipoHw,h.IdIncidencia,DATE_FORMAT(h.FechaHora, "%d/%m/%Y %H:%i:%s") as FechaHora,' +
                    'DATE_FORMAT(h.Reconocida, "%d/%m/%Y %H:%i:%s") as Reconocida,h.Descripcion,h.Usuario,I.LineaEventos as Alarma, I.Nivel as TipoAlarma ' +
                    'FROM historicoincidencias h,Incidencias I WHERE H.IdIncidencia=I.IdIncidencia AND h.FechaHora>=\'' + startTime + '\' AND h.FechaHora<=\'' + endTime + '\'  ' +
                    'ORDER BY -h.FechaHora ' + 'LIMIT ' + parseInt(start) + ',' + parseInt(howMany);
            else
                queryString = 'SELECT h.IdHw,h.TipoHw,h.IdIncidencia,DATE_FORMAT(h.FechaHora, "%d/%m/%Y %H:%i:%s") as FechaHora,' +
                    'DATE_FORMAT(h.Reconocida, "%d/%m/%Y %H:%i:%s") as Reconocida,h.Descripcion,h.Usuario,I.LineaEventos as Alarma, I.Nivel as TipoAlarma ' +
                    'FROM historicoincidencias h ,Incidencias I WHERE H.IdIncidencia=I.IdIncidencia AND h.FechaHora>=\'' + startTime + '\' AND h.FechaHora<=\'' + endTime + '\'  ' +
                    'ORDER BY -h.FechaHora LIMIT 1000';

            var query = connection.query(queryString, function(err, rows, fields) {

                /** 20170508. Encontrar '0' registros no se debe considerar ERROR */
                // if (err || rows.length == 0){
                // 	logging.Trace(query.sql);
                // 	connection.end();	
                // 	return f(err ? err : 'NO_DATA');
                // }

                // connection.end();	
                // logging.Trace(query.sql);
                // f({error: err, howMany: rows.length, historics: rows});
                connection.end();
                if (err) {
                    f(err);
                }
                else {
                    logging.Trace(query.sql);
                    f({ error: err, howMany: rows.length, historics: rows });
                }
            });
        }
    });
};

/****************************/
/*	FUNCTION: getGroups 	*/
/*  PARAMS: 			    */
/****************************/
exports.getGroups = function getGroups(f) {
    var query = 'SELECT DISTINCT(TipoHw) FROM historicoincidencias';
    var param = null;
    ug5kdb.Query(query, param, function(err, rows) {
        var resultado = {
            error: err,
            groups: rows
        };
        if (f) f(resultado);
    }, true);
};

exports.getGroups_v1 = function getGroups_v1(f) {
    var mySql = require('mySql');
    var connection = ug5kdb.GetDbConnection();/* mySql.createConnection({
        host: gcfg.Ulises.dbhost,
        user: gcfg.Ulises.dbuser,
        password: gcfg.Ulises.dbpassword,
        database: gcfg.Ulises.dbdatabase
    });*/

    connection.connect(function(err) {
        if (err) {
            logging.Error("Error connection to 'U5K-G' database.");
        }
        else {
            

            var query = connection.query('SELECT DISTINCT(TipoHw) FROM historicoincidencias', function(err, rows, fields) {

                /** 20170508. Encontrar '0' registros no se debe considerar ERROR. «TODO» */
                if (err || rows.length == 0) {
                    connection.end();
                    return f(err ? err : 'NO_DATA');
                }

                connection.end();
                logging.Trace(query.sql);
                f({ error: err, groups: rows });
            });
        }
    });
};

/********************************/
/*	FUNCTION: getComponents 	*/
/*  PARAMS: 				    */
/********************************/
exports.getComponents = function getComponents(f) {
    var query = 'SELECT DISTINCT(IdHw) FROM historicoincidencias';
    var param = null;
    ug5kdb.Query(query, param, function(err, rows) {
        var resultado = {
            error: err,
            components: rows
        };
        if (f) f(resultado);
    }, true);
};

exports.getComponents_v1 = function getComponents_v1(f) {
    var mySql = require('mySql');
    var connection = ug5kdb.GetDbConnection();/* mySql.createConnection({
        host: gcfg.Ulises.dbhost,
        user: gcfg.Ulises.dbuser,
        password: gcfg.Ulises.dbpassword,
        database: gcfg.Ulises.dbdatabase
    });*/

    connection.connect(function(err) {
        if (err) {
            logging.Error("Error connection to 'U5K-G' database.");
        }
        else {
            

            var query = connection.query('SELECT DISTINCT(IdHw) FROM historicoincidencias', function(err, rows, fields) {

                /** 20170508. Encontrar '0' registros no se debe considerar ERROR «TODO» */
                if (err || rows.length == 0) {
                    connection.end();
                    return f(err ? err : 'NO_DATA');
                }

                connection.end();
                logging.Trace(query.sql);
                f({ error: err, components: rows });
            });
        }
    });
};

/************************/
/*	FUNCTION: getCodes 	*/
/*  PARAMS: 		    */
/************************/
exports.getCodes = function getCodes(f) {
    var query = 'SELECT IdIncidencia,Incidencia,Error FROM incidencias ORDER BY Incidencia';
    var param = null;
    ug5kdb.Query(query, param, function(err, rows) {
        var resultado = {
            error: err,
            codes: rows
        };
        if (f) f(resultado);
    }, true);
};

exports.getCodes_v1 = function getCodes_v1(f) {
    var mySql = require('mySql');
    var connection = ug5kdb.GetDbConnection();/* mySql.createConnection({
        host: gcfg.Ulises.dbhost,
        user: gcfg.Ulises.dbuser,
        password: gcfg.Ulises.dbpassword,
        database: gcfg.Ulises.dbdatabase
    });*/

    connection.connect(function(err) {
        if (err) {
            logging.Error("Error connection to 'U5K-G' database.");
        }
        else {
            

            var query = connection.query('SELECT IdIncidencia,Incidencia,Error FROM incidencias ORDER BY Incidencia', function(err, rows, fields) {

                /** 20170508. Encontrar '0' registros no se debe considerar ERROR «TODO» */
                if (err || rows.length == 0) {
                    connection.end();
                    return f(err ? err : 'NO_DATA');
                }

                connection.end();
                logging.Trace(query.sql);
                f({ error: err, codes: rows });
            });
        }
    });
};

/************************************/
/*	FUNCTION: Obsoleta. Eliminar 	*/
/*  PARAMS: 				        */
/************************************/
exports.getStatisticsRateByDatetime = function getStatisticsRateByDatetime(data, f) {
    var mySql = require('mySql');
    var connection = ug5kdb.GetDbConnection();/* mySql.createConnection({
        host: gcfg.Ulises.dbhost,
        user: gcfg.Ulises.dbuser,
        password: gcfg.Ulises.dbpassword,
        database: gcfg.Ulises.dbdatabase
    });*/

    connection.connect(function(err) {
        if (err) {
            logging.Error("Error connection to 'U5K-G' database.");
        }
        else {
            

            async.parallel({
                rate: function(callback) {
                    var queryString = '';
                    queryString = 'SELECT ' +
                        '(SELECT COUNT(*) AS fallos ' +
                        'FROM historicoincidencias WHERE FechaHora>=\'' + data.startTime + '\' AND FechaHora<=\'' + data.endTime + '\' ' +
                        ' AND IdIncidencia IN (SELECT IdIncidencia FROM incidencias WHERE error=1))' +
                        '/' +
                        '(SELECT COUNT(*) AS total ' +
                        'FROM historicoincidencias WHERE FechaHora>=\'' + data.startTime + '\' AND FechaHora<=\'' + data.endTime + '\' )' +
                        ' * 100 AS rate';

                    var query = connection.query(queryString, function(err, rows, fields) {
                        /** 20170508. Encontrar '0' registros no se debe considerar ERROR */
                        if (err || rows.length == 0) {
                            logging.Trace(query.sql);
                            return callback(err);
                        }

                        callback(null, rows[0].rate);
                    });
                },
                mtbf: function(callback) {
                    var queryString = '';
                    queryString = 'SELECT COUNT(*) AS fallos ' +
                        'FROM historicoincidencias WHERE FechaHora>=\'' + data.startTime + '\' AND FechaHora<=\'' + data.endTime + '\' ' +
                        ' AND IdIncidencia IN (SELECT IdIncidencia FROM incidencias WHERE error=1)';

                    var query = connection.query(queryString, function(err, rows, fields) {
                        /** 20170508. Encontrar '0' registros no se debe considerar ERROR */
                        if (err || rows.length == 0) {
                            logging.Trace(query.sql);
                            return callback(err);
                        }

                        var ini = new Date(data.startTime);
                        var fin = new Date(data.endTime);
                        var dif = fin.getTime() - ini.getTime();
                        var dias = Math.floor(dif / (1000 * 60 * 60 * 24));

                        callback(null, rows[0].fallos > 0 ? dias / rows[0].fallos : 0);
                    });
                },
                mut: function(callback) {
                    var queryString = '';
                    queryString = 'SELECT SUM(TiempoEnFallo) AS tiempo ' +
                        'FROM estadisticas WHERE TimeStamp>=\'' + data.startTime + '\' AND TimeStamp<=\'' + data.endTime + '\' ' +
                        ' AND IdEvento IN (SELECT IdIncidencia FROM incidencias WHERE error=1)';

                    var query = connection.query(queryString, function(err, rows, fields) {
                        /** 20170508. Encontrar '0' registros no se debe considerar ERROR */
                        if (err || rows.length == 0) {
                            logging.Trace(query.sql);
                            return callback(err);
                        }

                        var ini = new Date(data.startTime);
                        var fin = new Date(data.endTime);
                        var dif = fin.getTime() - ini.getTime();
                        var seg = Math.floor(dif / 1000);

                        callback(null, (seg - rows[0].tiempo) / seg * 100);
                    });
                }
            },
                function(error, results) {
                    connection.end();
                    f({ error: err, rate: results.rate, mtbf: results.mtbf, mut: results.mut });
                }
            );
        }
    });
};

/************************************/
/*	FUNCTION: Obsoleta. Eliminar 	*/
/*  PARAMS: 				        */
/************************************/
exports.getStatisticsRateByIdHw = function getStatisticsRateByIdHw(data, f) {
    var mySql = require('mySql');
    var connection = ug5kdb.GetDbConnection();/* mySql.createConnection({
        host: gcfg.Ulises.dbhost,
        user: gcfg.Ulises.dbuser,
        password: gcfg.Ulises.dbpassword,
        database: gcfg.Ulises.dbdatabase
    });*/

    connection.connect(function(err) {
        if (err) {
            logging.Error("Error connection to 'U5K-G' database.");
        }
        else {
            async.parallel({
                rate: function(callback) {
                    var queryString = '';
                    queryString = 'SELECT ' +
                        '(SELECT COUNT(*) AS fallos ' +
                        'FROM historicoincidencias WHERE IdHw IN (' + data.code + ')' +
                        ' AND FechaHora>=\'' + data.startDate + '\' AND FechaHora<=\'' + data.endDate + '\' ' +
                        ' AND IdIncidencia IN (SELECT IdIncidencia FROM incidencias WHERE error=1))' +
                        '/' +
                        '(SELECT COUNT(*) AS total ' +
                        'FROM historicoincidencias WHERE IdHw IN (' + data.code + ')' +
                        ' AND FechaHora>=\'' + data.startDate + '\' AND FechaHora<=\'' + data.endDate + '\' )' +
                        ' * 100 AS rate';

                    var query = connection.query(queryString, function(err, rows, fields) {
                        /** 20170508. Encontrar '0' registros no se debe considerar ERROR */
                        if (err || rows.length == 0) {
                            logging.Trace(query.sql);
                            return callback(err);
                        }

                        callback(null, rows[0].rate);
                    });
                },
                mtbf: function(callback) {
                    var queryString = '';
                    queryString = 'SELECT COUNT(*) AS fallos ' +
                        'FROM historicoincidencias WHERE IdHw IN (' + data.code + ')' +
                        ' AND FechaHora>=\'' + data.startDate + '\' AND FechaHora<=\'' + data.endDate + '\' ' +
                        ' AND IdIncidencia IN (SELECT IdIncidencia FROM incidencias WHERE error=1)';

                    var query = connection.query(queryString, function(err, rows, fields) {
                        /** 20170508. Encontrar '0' registros no se debe considerar ERROR */
                        if (err || rows.length == 0) {
                            logging.Trace(query.sql);
                            return callback(err);
                        }

                        var ini = new Date(data.startDate);
                        var fin = new Date(data.endDate);
                        var dif = fin.getTime() - ini.getTime();
                        var dias = Math.floor(dif / (1000 * 60 * 60 * 24));

                        callback(null, rows[0].fallos > 0 ? dias / rows[0].fallos : 0);
                    });
                },
                mut: function(callback) {
                    var queryString = '';
                    queryString = 'SELECT SUM(TiempoEnFallo) AS tiempo ' +
                        'FROM estadisticas WHERE IdHw IN (' + data.code + ')' +
                        ' AND TimeStamp>=\'' + data.startDate + '\' AND TimeStamp<=\'' + data.endDate + '\' ' +
                        ' AND IdEvento IN (SELECT IdIncidencia FROM incidencias WHERE error=1)';

                    var query = connection.query(queryString, function(err, rows, fields) {
                        /** 20170508. Encontrar '0' registros no se debe considerar ERROR */
                        if (err || rows.length == 0) {
                            logging.Trace(query.sql);
                            return callback(err);
                        }

                        var ini = new Date(data.startDate);
                        var fin = new Date(data.endDate);
                        var dif = fin.getTime() - ini.getTime();
                        var seg = Math.floor(dif / 1000);

                        callback(null, ((seg - rows[0].tiempo) / seg) * 100);
                    });
                }
            },
                function(error, results) {
                    connection.end();
                    f({ error: err, rate: results.rate, mtbf: results.mtbf, mut: results.mut });
                }
            );
        }
    });
};

/************************************/
/*	FUNCTION: Obsoleta. Eliminar 	*/
/*  PARAMS: 				        */
/************************************/
exports.getStatisticsRateByIdEvent = function getStatisticsRateByIdEvent(data, f) {
    var mySql = require('mySql');
    var connection = ug5kdb.GetDbConnection();/* mySql.createConnection({
        host: gcfg.Ulises.dbhost,
        user: gcfg.Ulises.dbuser,
        password: gcfg.Ulises.dbpassword,
        database: gcfg.Ulises.dbdatabase
    });*/

    connection.connect(function(err) {
        if (err) {
            logging.Error("Error connection to 'U5K-G' database.");
        }
        else {
            

            async.parallel({
                rate: function(callback) {
                    var queryString = '';
                    queryString = 'SELECT ' +
                        '(SELECT COUNT(*) AS fallos ' +
                        'FROM historicoincidencias WHERE IdIncidencia=\'' + data.code + '\'' +
                        ' AND FechaHora>=\'' + data.startDate + '\' AND FechaHora<=\'' + data.endDate + '\' )' +
                        '/' +
                        '(SELECT COUNT(*) AS total ' +
                        'FROM historicoincidencias WHERE' +
                        ' FechaHora>=\'' + data.startDate + '\' AND FechaHora<=\'' + data.endDate + '\' ' +
                        ' AND IdIncidencia IN (SELECT IdIncidencia FROM incidencias WHERE error=1))' +
                        ' * 100 AS rate';


                    var query = connection.query(queryString, function(err, rows, fields) {
                        /** 20170508. Encontrar '0' registros no se debe considerar ERROR */
                        if (err || rows.length == 0) {
                            logging.Trace(query.sql);
                            return callback(err);
                        }

                        callback(null, rows[0].rate);
                    });
                },
                mtbf: function(callback) {
                    var queryString = '';
                    queryString = 'SELECT COUNT(*) AS fallos ' +
                        'FROM historicoincidencias WHERE IdIncidencia=\'' + data.code + '\'' +
                        ' AND FechaHora>=\'' + data.startDate + '\' AND FechaHora<=\'' + data.endDate + '\' ';

                    var query = connection.query(queryString, function(err, rows, fields) {
                        /** 20170508. Encontrar '0' registros no se debe considerar ERROR */
                        if (err || rows.length == 0) {
                            logging.Trace(query.sql);
                            return callback(err);
                        }

                        var ini = new Date(data.startDate);
                        var fin = new Date(data.endDate);
                        var dif = fin.getTime() - ini.getTime();
                        var dias = Math.floor(dif / (1000 * 60 * 60 * 24));

                        callback(null, rows[0].fallos > 0 ? dias / rows[0].fallos : 0);
                    });
                },
                mut: function(callback) {
                    var queryString = '';
                    queryString = 'SELECT SUM(TiempoEnFallo) AS tiempo ' +
                        'FROM estadisticas WHERE IdEvento=' + data.code +
                        ' AND TimeStamp>=\'' + data.startDate + '\' AND TimeStamp<=\'' + data.endDate + '\' ';

                    var query = connection.query(queryString, function(err, rows, fields) {
                        /** 20170508. Encontrar '0' registros no se debe considerar ERROR */
                        if (err || rows.length == 0) {
                            logging.Trace(query.sql);
                            return callback(err);
                        }

                        var ini = new Date(data.startDate);
                        var fin = new Date(data.endDate);
                        var dif = fin.getTime() - ini.getTime();
                        var seg = Math.floor(dif / 1000);

                        callback(null, ((seg - rows[0].tiempo) / seg) * 100);
                    });
                }
            },
                function(error, results) {
                    connection.end();
                    f({ error: err, rate: results.rate, mtbf: results.mtbf, mut: results.mut });
                }
            );
        }
    });
};

/********************************/
/*	FUNCTION: postHistorics 	*/
/*  PARAMS: 				    */
/********************************/
exports.postHistorics = async function postHistorics(Incidencia, f) {
    var query1 = '(SELECT e.nombre FROM emplazamientos e ' +
        'INNER JOIN pasarelas c ON emplazamiento_id = e.idemplazamiento ' +
        'WHERE c.nombre=\'' + Incidencia.IdHw + '\')';
    var param1 = null;
    var query2 = '(SELECT Grupo,Descripcion FROM incidencias i ' +
        'WHERE i.IdIncidencia=' + Incidencia.IdIncidencia + ')';
    var param2 = null;


    /** Ver si el codigo de la incidencia esta en BDT */
    var res_query2 = await ug5kdb.QuerySync(query2, param2);
    if (res_query2.error || res_query2.data == null || res_query2.data.length == 0) {
        /** Si no existe la incidencia señalizamos el error y abortamos... */
        if (f) f(null);
        return;
    }

    /** Ver si hay un emplazamiento asociado a el IdHw. Puede que no haya... */
    var res_query1 = await ug5kdb.QuerySync(query1, param1);
    var empl = res_query1.error || res_query1.data == null || res_query1.data.length == 0 ? null : res_query1.rows[0].IdEmplaz;

    var inciden = res_query2.data[0];

    Incidencia.IdEmplaz = empl;
    Incidencia.TipoHw = inciden.Grupo;
    Incidencia.Descripcion = inciden.Descripcion + ' ' + Incidencia.Param + '.';
    Incidencia.FechaHora = new Date();
    delete Incidencia.Param;

    var query_insert = 'INSERT INTO historicoincidencias SET ?';
    ug5kdb.Query(query_insert, Incidencia, function(err, rows) {
        if (f) f(err);
    });
};
///
exports.postHistorics_v1 = function postHistorics_v2(Incidencia, f) {
    var mySql = require('mySql');
    var connection = ug5kdb.GetDbConnection();/* mySql.createConnection({
        host: gcfg.Ulises.dbhost,
        user: gcfg.Ulises.dbuser,
        password: gcfg.Ulises.dbpassword,
        database: gcfg.Ulises.dbdatabase
    });*/

    connection.connect(function(err) {
        if (err) {
            logging.Error("Error connection to 'U5K-G' database.");
        }
        else {
            

            async.parallel({
                IdEmplaz: function(callback) {
                    var qEmplaz = '(SELECT e.name FROM emplazamiento e ' +
                        'INNER JOIN cgw c ON EMPLAZAMIENTO_idEMPLAZAMIENTO = e.idEMPLAZAMIENTO ' +
                        'WHERE c.name=\'' + Incidencia.IdHw + '\')';
                    var q = connection.query(qEmplaz, function(err, rows, fields) {
                        logging.Trace(q.sql);
                        if (err)
                            return callback(null);
                        else if (rows == null || rows.length == 0)
                            return callback(null, null);

                        callback(null, rows[0].name);
                    });
                },
                inciden: function(callback) {
                    var qIncidencias = '(SELECT Grupo,Descripcion FROM incidencias i ' +
                        'WHERE i.IdIncidencia=' + Incidencia.IdIncidencia + ')';
                    var q = connection.query(qIncidencias, function(err, rows, fields) {
                        logging.Trace(q.sql);
                        if (err || rows == null || rows.length == 0) {
                            return callback(null);
                        }
                        callback(null, { Grupo: rows[0].Grupo, Descripcion: rows[0].Descripcion });
                    });
                }
            }, function(error, results) {
                if (error) {
                    connection.end();
                    return logging.Trace("Error in parallel postHistorics() function.");
                }

                Incidencia.IdEmplaz = results.IdEmplaz;

                if (typeof results.inciden == 'undefined') {
                    results.inciden = new Object();
                    results.inciden.Grupo = null;
                    results.inciden.Descripcion = null;
                }
                Incidencia.TipoHw = results.inciden.Grupo;
                Incidencia.Descripcion = results.inciden.Descripcion + ' ' + Incidencia.Param + '.';
                Incidencia.FechaHora = new Date();
                delete Incidencia.Param;

                var query = connection.query('INSERT INTO historicoincidencias SET ?', Incidencia, function(err, result) {
                    connection.end();
                    if (err) {
                        logging.Trace(query.sql);
                        return f(err ? err : 'NO_DATA');
                    }

                    logging.Trace(query.sql);
                    f({ error: null, Incidencia: Incidencia });
                });
            });
        }
    });
};

/****************************/
/*	FUNCTION: deepHistoric 	*/
/*  PARAMS: 			    */
/****************************/
exports.deepHistorics = function deepHistorics(days, f) {

    var query = 'DELETE FROM historicoincidencias WHERE FechaHora < NOW() - INTERVAL ? DAY';
    var param = days;
    ug5kdb.Query(query, param, function(err, rows) {
        var resultado = {
            error: err,
            affectedRows: !err ? rows.affectedRows : 0
        };
        if (f) f(resultado);
    });
};
///
exports.deepHistorics_v1 = function deepHistorics_v1(days, f) {
    var mySql = require('mySql');
    var connection = ug5kdb.GetDbConnection();/* mySql.createConnection({
        host: gcfg.Ulises.dbhost,
        user: gcfg.Ulises.dbuser,
        password: gcfg.Ulises.dbpassword,
        database: gcfg.Ulises.dbdatabase
    });*/

    connection.connect(function(err) {
        if (err) {
            logging.Error("Error connection to 'U5K-G' database.");
        }
        else {
            

            var query = connection.query('DELETE FROM historicoincidencias WHERE FechaHora < NOW() - INTERVAL ? DAY', days, function(err, result) {
                /** 20170508. Encontrar '0' registros no se debe considerar ERROR «TODO» */
                if (err) {
                    logging.Trace(query.sql);
                    connection.end();
                    return f(err ? err : 'NO_DATA');
                }

                connection.end();
                logging.Trace(query.sql);
                f({ error: err, affectedRows: result.affectedRows });
            });
        }
    });
};
