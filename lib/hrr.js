var async = require('async');

var logging = require('./nu-log.js');

/** AGL */
var gcfg = require('../configUlises.json');
var ug5kdb = require('./ug5kdb.js');
/************************************/
/*	FUNCTION: getConfigurations 	*/
/*  PARAMS: 						*/
/*  REV 1.0.2 VMG					*/
/************************************/
exports.getConfigurations = function getConfigurations(req, res) {
    var cfgs = [];
    var mySql = require('mySql');
    var connection = ug5kdb.GetDbConnectionOnTz('+02:00');/* mySql.createConnection({
        host: gcfg.Ulises.dbhost,
        user: gcfg.Ulises.dbuser,
        password: gcfg.Ulises.dbpassword,
        timezone: '+02:00',
        database: gcfg.Ulises.dbdatabase
    });*/

    var convertTimeZone = '+02:00';
    connection.connect(function(err, usrs) {
        if (err) {
            logging.Trace("Error connention to 'U5K-G' database.");
        }
        else {
            

            var query = connection.query("SELECT idconfiguracion as idCFG, nombre as name, descripcion as description," +
                "region, activa, CONCAT(DATE_FORMAT(fecha_activacion, '%Y'),'-'," +
                "DATE_FORMAT(fecha_activacion, '%m'),'-'," +
                "DATE_FORMAT(fecha_activacion, '%d'),'T'," +
                "DATE_FORMAT(fecha_activacion, '%H'),':'," +
                "DATE_FORMAT(fecha_activacion, '%i'),':'," +
                "DATE_FORMAT(fecha_activacion, '%s')) as ts_activa " +
                "FROM configuraciones WHERE activa = 0", function(err, rows, fields) {
                    logging.Trace(query.sql);
                    connection.end();
                    if (err) {
                        if (err.fatal) {
                            logging.Error('fatal error: ' + err.message);
                            startConnection();
                        }
                        res.json({ error: err.message });
                    }
                    else {
                        cfgs = rows;
                        logging.Trace(JSON.stringify({ result: cfgs }, null, '\t'));
                        res.json({ result: cfgs });
                    }
                });
        }
    });
};

/************************************/
/*	FUNCTION: checkConfigName 	*/
/*  PARAMS: 						*/
/*  REV 1.0.2 VMG					*/
/************************************/
exports.checkConfigName = function checkConfigName(name, idCfg, f) {
    var cfgs = [];
    var mySql = require('mySql');
    var connection = ug5kdb.GetDbConnection();/* mySql.createConnection({
        host: gcfg.Ulises.dbhost,
        user: gcfg.Ulises.dbuser,
        password: gcfg.Ulises.dbpassword,
        database: gcfg.Ulises.dbdatabase
    });*/

    connection.connect(function(err, usrs) {
        if (err) {
            logging.Trace("Error connention to 'U5K-G' database.");
        }
        else {
            

            var query = connection.query('SELECT COUNT(*) as cuantos ' +
                'FROM configuraciones ' +
                'WHERE nombre LIKE ? ' +
                'AND idconfiguracion != ?', [name, idCfg], function(err, rows, fields) {
                    logging.Trace(query.sql);
                    connection.end();
                    if (err)
                        return f({ error: err.message });
                    else {
                        if (rows[0].cuantos == 0)
                            return f({ data: 'OK' });
                        else
                            return f({ data: 'DUP_NAME' });
                    }
                });
        }
    });
};

/********************************/
/*	FUNCTION: getConfiguration 	*/
/*  PARAMS: res,				*/
/*			red,				*/
/*			configuration		*/
/*  REV 1.0.2 VMG				*/
/********************************/
exports.getConfiguration = function getConfiguration(req, res, cfg) {
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
            
        }
        var query = connection.query('SELECT c.idconfiguracion as idCFG, c.nombre as name, ' +
            'c.descripcion as description, c.activa as activa, ' +
            'DATE_FORMAT(c.activa, "%d/%m/%Y %H:%i:%s") as ts_activa, ' +
            'e.nombre as nameSite, e.idemplazamiento as idEMPLAZAMIENTO ' +
            'FROM configuraciones c ' +
            'LEFT JOIN emplazamientos e ON c.idconfiguracion = e.configuracion_id ' +
            'WHERE c.idconfiguracion = ?', cfg, function(err, rows, fields) {
                logging.Trace(query.sql);
                connection.end();
                if (err)
                    res.json({ error: err.message });
                else {
                    var c = rows;
                    logging.Trace(JSON.stringify({ result: c }, null, '\t'));
                    res.json({ result: c });
                }
            });
    });
};

/************************************/
/*	FUNCTION: postConfiguration 	*/
/*  PARAMS: newGateway				*/
/*  REV 1.0.2 VMG					*/
/************************************/
exports.postConfiguration = function postConfiguration(req, res, newConfiguration, f) {
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
            
        }

        var query = connection.query('INSERT INTO configuraciones (nombre, descripcion) ' +
            'VALUES (?,?)', [newConfiguration.name, newConfiguration.description],
            function(err, result) {
                logging.Trace(query.sql);
                connection.end();
                if (err) {
                    return f({ error: err.message, data: newConfiguration });
                }
                else {
                    newConfiguration.idCFG = result.insertId;
                    return f({ error: null, data: newConfiguration });
                }
            });
    });
};

/************************************/
/*	FUNCTION: putConfiguration 		*/
/*  PARAMS: oldIdConf,				*/
/*			cfg,					*/
/*          f  						*/
/*  REV 1.0.2 VMG					*/
/************************************/
exports.putConfiguration = function putConfiguration(oldIdConf, cfg, f) {
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
            return;
        }
        else {
            
        }

        var query = connection.query('UPDATE configuraciones SET nombre=?, descripcion=? ' +
            'WHERE idconfiguracion=?', [cfg.name, cfg.description, cfg.idCFG],
            function(err, result) {
                logging.Trace(query.sql);
                if (err) {
                    return f({ error: err.message, data: null });
                }
                else {
                    query = connection.query('UPDATE pasarelas p ' +
                        'LEFT JOIN emplazamientos e ON p.emplazamiento_id=e.idemplazamiento ' +
                        'LEFT JOIN configuraciones c ON e.configuracion_id=c.idconfiguracion ' +
                        'SET p.pendiente_actualizar=1 ' +
                        'WHERE c.idconfiguracion=?', [cfg.idCFG],
                        function(err, result) {
                            logging.Trace(query.sql);
                            connection.end();
                            if (err) {
                                return f({ error: err.message, data: null });
                            }
                            else
                                return f({ error: null, data: cfg });
                        });
                }
            });
    });
};

/********************************/
/*	FUNCTION: delConfiguration 	*/
/*  PARAMS: res,				*/
/*			req,				*/
/*			cfg,				*/
/*			f 					*/
/*  REV 1.0.2 VMG				*/
/********************************/
exports.delConfiguration = function delConfiguration(req, res, cfg, f) {
    var mySql = require('mySql');
    var connection = ug5kdb.GetDbConnection();/* mySql.createConnection({
        host: gcfg.Ulises.dbhost,
        user: gcfg.Ulises.dbuser,
        password: gcfg.Ulises.dbpassword,
        database: gcfg.Ulises.dbdatabase,
        multipleStatements: true
    });*/

    connection.connect(function(err, usrs) {
        if (err) {
            logging.Error("Error connection to 'U5K-G' database.");
        }
        else {
            

            var query = connection.query('DELETE FROM configuraciones WHERE idconfiguracion=?', [cfg],
                function(err, result) {
                    logging.Trace(query.sql);
                    connection.end();
                    if (err)
                        f({ error: err.message });
                    else
                        f({ data: 'OK' });
                });
        }
    });
};

/*var query = connection.query('DELETE FROM CFG WHERE ??=?', ['name', cfg], function (err, result) {
 logging.Trace(query.sql);
 f({error: null, data: cfg});
 
 connection.end();
 });*/
/************************************/
/*	FUNCTION: copyConfiguration 	*/
/*  PARAMS: src: idSourceConfig		*/
/*			trgt.name				*/
/*			trgt.description  		*/
/*									*/
/*  REV 1.0.2 VMG					*/
/************************************/
exports.copyConfiguration = function copyConfiguration(idSourceConfig, trgt, f) {
    var mySql = require('mySql');
    var connection = ug5kdb.GetDbConnection();/* mySql.createConnection({
        host: gcfg.Ulises.dbhost,
        user: gcfg.Ulises.dbuser,
        password: gcfg.Ulises.dbpassword,
        database: gcfg.Ulises.dbdatabase,
        multipleStatements: true
    });*/

    connection.connect(function(err) {
        if (err) {
            logging.Error("Error connection to 'U5K-G' database.");
        }
        else {
            

            var newIdCfg = 0;
            var oldSiteData = [];
            var linkedSiteData = [];
            var oldGtwData = [];
            var linkedGtwData = [];
            var oldGtwIpData = [];
            var oldGtwRadioResData = [];
            var linkedGtwRadioResData = [];
            var oldGtwTfnoResData = [];
            var linkedGtwTfnoResData = [];
            var oldGtwRadioResLista_UrisData = [];
            var oldGtwTfnoResRangos_AtsData = [];

            //// CODIGO ASÍNCRONO
            //async.waterfall([
            //    insertNewCfg,
            //    selectSitesFromCfg,
            //    insertNewSites,
            //    selectGateways,
            //    insertNewGtws,
            //    selectGatewayIps,
            //    insertNewGtwIps,
            //    selectGatewayRadioRes,
            //    insertNewGtwRadioRes,
            //    selectGatewayTfnoRes,
            //    insertNewGtwTfnoRes,
            //    selectRadioResLista_Uris,
            //    insertNewRadioResLista_Uris,
            //    selectTfnoResRangos_Ats,
            //    insertNewTfnoResRangos_Ats
            //], function (err, result) {
            //    connection.end();
            //    f({ data: 'OK' });
            //});

            var insertNewCfg = function /*insertNewCfg*/(callback) {
                var query = connection.query('INSERT INTO configuraciones ' +
                    '(nombre,descripcion,activa) VALUES (?,?,0)', [trgt.name, trgt.description],
                    function(err, rows) {
                        logging.Trace(query.sql);
                        if (err || rows.length == 0) {
                            return callback(rows.length == 0 ? 'NO_DATA' : err);
                        }
                        else {
                            newIdCfg = rows.insertId;
                            return callback(null);
                        }
                    });
            };
            var selectSitesFromCfg = function /*selectSitesFromCfg*/(callback) {
                var query = connection.query('SELECT e.idemplazamiento,e.nombre ' +
                    'FROM emplazamientos e ' +
                    'LEFT JOIN configuraciones c ON e.configuracion_id=c.idconfiguracion ' +
                    'WHERE c.idconfiguracion=?', [idSourceConfig],
                    function(err, rows) {
                        logging.Trace(query.sql);
                        if (err || rows.length == 0) {
                            return callback(rows.length == 0 ? 'NO_DATA' : err);
                        }
                        else {
                            oldSiteData = rows;
                            return callback(null);
                        }
                    });
            };
            var insertNewSites = async function /*insertNewSites*/(callback) {
                var query = '';
                var res = '';
                for (var i = 0; i < oldSiteData.length; i++) {
                    query = 'INSERT INTO emplazamientos (nombre, configuracion_id) ' +
                        'VALUES ("' + oldSiteData[i].nombre + '",' + newIdCfg + ');';
                    res = await ug5kdb.QueryMultiInsertSync(query);
                    var element = new Object();
                    element.oldSiteId = oldSiteData[i].idemplazamiento;
                    element.newSiteId = res.data.insertId;
                    linkedSiteData.push(element);
                }
                return callback(null);
            };
            var selectGateways = function /*selectGateways*/(callback) {
                var query = connection.query('SELECT p.* ' +
                    'FROM emplazamientos e ' +
                    'LEFT JOIN configuraciones c ON e.configuracion_id=c.idconfiguracion ' +
                    'LEFT JOIN pasarelas p ON e.idemplazamiento=p.emplazamiento_id ' +
                    'WHERE c.idconfiguracion=?', [idSourceConfig],
                    function(err, rows) {
                        logging.Trace(query.sql);
                        if (err || rows.length == 0) {
                            return callback(rows.length == 0 ? 'NO_DATA' : err);
                        }
                        else {
                            oldGtwData = rows;
                            return callback(null);
                        }
                    });
            };
            var insertNewGtwsasync = async function /*insertNewGtws*/(callback) {
                var query = '';
                var res = '';
                var empId2Insert = 0;
                for (var i = 0; i < oldGtwData.length; i++) {
                    if (oldGtwData[i].idpasarela != null) {
                        for (var j = 0; j < linkedSiteData.length; j++) {
                            if (linkedSiteData[j].oldSiteId == oldGtwData[i].emplazamiento_id)
                                empId2Insert = linkedSiteData[j].newSiteId;
                        }
                        query = 'INSERT INTO pasarelas (emplazamiento_id,nombre,ip_virtual,ultima_actualizacion,ip_cpu0,' +
                            'ip_gtw0,mask_cpu0,ip_cpu1,ip_gtw1,mask_cpu1,puerto_sip,periodo_supervision,puerto_servicio_snmp,' +
                            'puerto_snmp,snmpv2,comunidad_snmp,nombre_snmp,localizacion_snmp,contacto_snmp,puerto_servicio_web,' +
                            'tiempo_sesion,puerto_rtsp,servidor_rtsp, servidor_rtspb) ' +
                            'VALUES (' + empId2Insert + ',"' + oldGtwData[i].nombre + '","' + oldGtwData[i].ip_virtual + '",NOW()' +
                            ',"' + oldGtwData[i].ip_cpu0 + '","' + oldGtwData[i].ip_gtw0 + '","' + oldGtwData[i].mask_cpu0 + '"' +
                            ',"' + oldGtwData[i].ip_cpu1 + '","' + oldGtwData[i].ip_gtw1 + '","' + oldGtwData[i].mask_cpu1 + '"' +
                            ',"' + oldGtwData[i].puerto_sip + '","' + oldGtwData[i].periodo_supervision + '","' + oldGtwData[i].puerto_servicio_snmp + '"' +
                            ',"' + oldGtwData[i].puerto_snmp + '","' + oldGtwData[i].snmpv2 + '","' + oldGtwData[i].comunidad_snmp + '"' +
                            ',"' + oldGtwData[i].nombre_snmp + '","' + oldGtwData[i].localizacion_snmp + '","' + oldGtwData[i].contacto_snmp + '"' +
                            ',"' + oldGtwData[i].puerto_servicio_web + '","' + oldGtwData[i].tiempo_sesion + '","' + oldGtwData[i].puerto_rtsp + '"' +
                            ',"' + oldGtwData[i].servidor_rtsp + '","' + oldGtwData[i].servidor_rtspb + '"' +
                            ');';
                        res = await ug5kdb.QueryMultiInsertSync(query);
                        var element = new Object();
                        element.oldGtwId = oldGtwData[i].idpasarela;
                        element.newGtwId = res.data.insertId;
                        linkedGtwData.push(element);
                    }
                }
                return callback(null);
            };
            var selectGatewayIps = function /*selectGatewayIps*/(callback) {
                var query = connection.query('SELECT li.* ' +
                    'FROM emplazamientos e ' +
                    'LEFT JOIN configuraciones c ON e.configuracion_id=c.idconfiguracion ' +
                    'LEFT JOIN pasarelas p ON e.idemplazamiento=p.emplazamiento_id ' +
                    'LEFT JOIN lista_ips li ON p.idpasarela=li.pasarela_id ' +
                    'WHERE c.idconfiguracion=?', [idSourceConfig],
                    function(err, rows) {
                        logging.Trace(query.sql);
                        if (err || rows.length == 0) {
                            return callback(rows.length == 0 ? 'NO_DATA' : err);
                        }
                        else {
                            oldGtwIpData = rows;
                            return callback(null);
                        }
                    });
            };
            var insertNewGtwIps = async function /*insertNewGtwIps*/(callback) {
                var query = '';
                var res = '';
                var gtwId2Insert = 0;
                for (var i = 0; i < oldGtwIpData.length; i++) {
                    if (oldGtwIpData[i].pasarela_id != null) {
                        for (var j = 0; j < linkedGtwData.length; j++) {
                            if (linkedGtwData[j].oldGtwId == oldGtwIpData[i].pasarela_id)
                                gtwId2Insert = linkedGtwData[j].newGtwId;
                        }
                        query = 'INSERT INTO lista_ips (pasarela_id,ip,tipo,selected) ' +
                            'VALUES (' + gtwId2Insert + ',"' + oldGtwIpData[i].ip + '","' + oldGtwIpData[i].tipo + '"' +
                            ',"' + oldGtwIpData[i].selected + '");';
                        res = await ug5kdb.QueryMultiInsertSync(query);
                    }
                }
                return callback(null);
            };
            var selectGatewayRadioRes = function /*selectGatewayRadioRes*/(callback) {
                var query = connection.query('SELECT rr.* ' +
                    'FROM emplazamientos e ' +
                    'LEFT JOIN configuraciones c ON e.configuracion_id=c.idconfiguracion ' +
                    'LEFT JOIN pasarelas p ON e.idemplazamiento=p.emplazamiento_id ' +
                    'LEFT JOIN recursos_radio rr ON p.idpasarela=rr.pasarela_id ' +
                    'WHERE c.idconfiguracion=?', [idSourceConfig],
                    function(err, rows) {
                        logging.Trace(query.sql);
                        if (err || rows.length == 0) {
                            return callback(rows.length == 0 ? 'NO_DATA' : err);
                        }
                        else {
                            oldGtwRadioResData = rows;
                            return callback(null);
                        }
                    });
            };
            var insertNewGtwRadioRes = async function /*insertNewGtwRadioRes*/(callback) {
                var query = '';
                var res = '';
                var gtwId2Insert = 0;
                for (var i = 0; i < oldGtwRadioResData.length; i++) {
                    if (oldGtwRadioResData[i].pasarela_id != null) {
                        for (var j = 0; j < linkedGtwData.length; j++) {
                            if (linkedGtwData[j].oldGtwId == oldGtwRadioResData[i].pasarela_id)
                                gtwId2Insert = linkedGtwData[j].newGtwId;
                        }
                        if (oldGtwRadioResData[i].clave_registro == null) {
                            query = 'INSERT INTO recursos_radio (pasarela_id,fila,columna,nombre,codec,' +
                                'frecuencia,ajuste_ad,ajuste_da,precision_audio,tipo_agente,indicacion_entrada_audio,' +
                                'indicacion_salida_audio,umbral_vad,metodo_bss,evento_ptt_squelch,prioridad_ptt,prioridad_sesion_sip,' +
                                'climax_bss,tabla_bss_id,retraso_interno_grs,habilita_grabacion,restriccion_entrantes) ' +
                                'VALUES ' +
                                '(' + gtwId2Insert + ',' + oldGtwRadioResData[i].fila + ',' + oldGtwRadioResData[i].columna + '' +
                                ',"' + oldGtwRadioResData[i].nombre + '",' + oldGtwRadioResData[i].codec + '' +
                                ',' + oldGtwRadioResData[i].frecuencia + ',' + oldGtwRadioResData[i].ajuste_ad + ',' + oldGtwRadioResData[i].ajuste_da + '' +
                                ',' + oldGtwRadioResData[i].precision_audio + ',' + oldGtwRadioResData[i].tipo_agente + ',' + oldGtwRadioResData[i].indicacion_entrada_audio + '' +
                                ',' + oldGtwRadioResData[i].indicacion_salida_audio + ',' + oldGtwRadioResData[i].umbral_vad + ',' + oldGtwRadioResData[i].metodo_bss + '' +
                                ',' + oldGtwRadioResData[i].evento_ptt_squelch + ',' + oldGtwRadioResData[i].prioridad_ptt + ',' + oldGtwRadioResData[i].prioridad_sesion_sip + '' +
                                ',' + oldGtwRadioResData[i].climax_bss + ',' + oldGtwRadioResData[i].tabla_bss_id + ',' + oldGtwRadioResData[i].retraso_interno_grs + '' +
                                ',' + oldGtwRadioResData[i].habilita_grabacion + ',' + oldGtwRadioResData[i].restriccion_entrantes + '' +
                                ');';
                        }
                        else {
                            query = 'INSERT INTO recursos_radio (pasarela_id,fila,columna,nombre,codec,' +
                                'clave_registro,frecuencia,ajuste_ad,ajuste_da,precision_audio,tipo_agente,indicacion_entrada_audio,' +
                                'indicacion_salida_audio,umbral_vad,metodo_bss,evento_ptt_squelch,prioridad_ptt,prioridad_sesion_sip,' +
                                'climax_bss,tabla_bss_id,retraso_interno_grs,habilita_grabacion,restriccion_entrantes) ' +
                                'VALUES ' +
                                '(' + gtwId2Insert + ',' + oldGtwRadioResData[i].fila + ',' + oldGtwRadioResData[i].columna + '' +
                                ',"' + oldGtwRadioResData[i].nombre + '",' + oldGtwRadioResData[i].codec + ',"' + oldGtwRadioResData[i].clave_registro + '"' +
                                ',' + oldGtwRadioResData[i].frecuencia + ',' + oldGtwRadioResData[i].ajuste_ad + ',' + oldGtwRadioResData[i].ajuste_da + '' +
                                ',' + oldGtwRadioResData[i].precision_audio + ',' + oldGtwRadioResData[i].tipo_agente + ',' + oldGtwRadioResData[i].indicacion_entrada_audio + '' +
                                ',' + oldGtwRadioResData[i].indicacion_salida_audio + ',' + oldGtwRadioResData[i].umbral_vad + ',' + oldGtwRadioResData[i].metodo_bss + '' +
                                ',' + oldGtwRadioResData[i].evento_ptt_squelch + ',' + oldGtwRadioResData[i].prioridad_ptt + ',' + oldGtwRadioResData[i].prioridad_sesion_sip + '' +
                                ',' + oldGtwRadioResData[i].climax_bss + ',' + oldGtwRadioResData[i].tabla_bss_id + ',' + oldGtwRadioResData[i].retraso_interno_grs + '' +
                                ',' + oldGtwRadioResData[i].habilita_grabacion + ',' + oldGtwRadioResData[i].restriccion_entrantes + '' +
                                ');';
                        }
                        res = await ug5kdb.QueryMultiInsertSync(query);
                        var element = new Object();
                        element.oldRrId = oldGtwRadioResData[i].idrecurso_radio;
                        element.newRrId = res.data.insertId;
                        linkedGtwRadioResData.push(element);
                    }
                }
                return callback(null);
            };
            var selectGatewayTfnoRes = function /*selectGatewayTfnoRes*/(callback) {
                var query = connection.query('SELECT rt.* ' +
                    'FROM emplazamientos e ' +
                    'LEFT JOIN configuraciones c ON e.configuracion_id=c.idconfiguracion ' +
                    'LEFT JOIN pasarelas p ON e.idemplazamiento=p.emplazamiento_id ' +
                    'LEFT JOIN recursos_telefono rt ON p.idpasarela=rt.pasarela_id ' +
                    'WHERE c.idconfiguracion=?', [idSourceConfig],
                    function(err, rows) {
                        logging.Trace(query.sql);
                        if (err || rows.length == 0) {
                            return callback(rows.length == 0 ? 'NO_DATA' : err);
                        }
                        else {
                            oldGtwTfnoResData = rows;
                            return callback(null);
                        }
                    });
            };
            var insertNewGtwTfnoRes = async function /*insertNewGtwTfnoRes*/(callback) {
                var query = '';
                var res = '';
                var gtwId2Insert = 0;
                for (var i = 0; i < oldGtwTfnoResData.length; i++) {
                    if (oldGtwTfnoResData[i].pasarela_id != null) {
                        for (var j = 0; j < linkedGtwData.length; j++) {
                            if (linkedGtwData[j].oldGtwId == oldGtwTfnoResData[i].pasarela_id)
                                gtwId2Insert = linkedGtwData[j].newGtwId;
                        }
                        if (oldGtwTfnoResData[i].clave_registro == null) {
                            query = 'INSERT INTO recursos_telefono (pasarela_id,fila,columna,nombre,' +
                                'codec,ajuste_ad,ajuste_da,tipo_interfaz_tel,uri_telefonica,deteccion_vox,umbral_vox,' +
                                'cola_vox,respuesta_automatica,periodo_tonos,lado,origen_test,destino_test,supervisa_colateral,' +
                                'tiempo_supervision,duracion_tono_interrup, ats_user) ' +
                                'VALUES ' +
                                '(' + gtwId2Insert + ',' + oldGtwTfnoResData[i].fila + ',' + oldGtwTfnoResData[i].columna + '' +
                                ',"' + oldGtwTfnoResData[i].nombre + '",' + oldGtwTfnoResData[i].codec + '' +
                                ',' + oldGtwTfnoResData[i].ajuste_ad + ',' + oldGtwTfnoResData[i].ajuste_da + '' +
                                ',' + oldGtwTfnoResData[i].tipo_interfaz_tel + ',"' + oldGtwTfnoResData[i].uri_telefonica + '",' + oldGtwTfnoResData[i].deteccion_vox + '' +
                                ',' + oldGtwTfnoResData[i].umbral_vox + ',' + oldGtwTfnoResData[i].cola_vox + ',' + oldGtwTfnoResData[i].respuesta_automatica + '' +
                                ',' + oldGtwTfnoResData[i].periodo_tonos + ',' + oldGtwTfnoResData[i].lado + ',"' + oldGtwTfnoResData[i].origen_test + '","' + oldGtwTfnoResData[i].destino_test + '"' +
                                ',' + oldGtwTfnoResData[i].supervisa_colateral + ',' + oldGtwTfnoResData[i].tiempo_supervision + ',' + oldGtwTfnoResData[i].duracion_tono_interrup + '' +
                                ',"' + oldGtwTfnoResData[i].ats_user + '"' +
                                ');';
                        }
                        else {
                            query = 'INSERT INTO recursos_telefono (pasarela_id,fila,columna,nombre,' +
                                'codec,clave_registro,ajuste_ad,ajuste_da,tipo_interfaz_tel,uri_telefonica,deteccion_vox,umbral_vox,' +
                                'cola_vox,respuesta_automatica,periodo_tonos,lado,origen_test,destino_test,supervisa_colateral,' +
                                'tiempo_supervision,duracion_tono_interrup, ats_user) ' +
                                'VALUES ' +
                                '(' + gtwId2Insert + ',' + oldGtwTfnoResData[i].fila + ',' + oldGtwTfnoResData[i].columna + '' +
                                ',"' + oldGtwTfnoResData[i].nombre + '",' + oldGtwTfnoResData[i].codec + ',"' + oldGtwTfnoResData[i].clave_registro + '"' +
                                ',' + oldGtwTfnoResData[i].ajuste_ad + ',' + oldGtwTfnoResData[i].ajuste_da + '' +
                                ',' + oldGtwTfnoResData[i].tipo_interfaz_tel + ',"' + oldGtwTfnoResData[i].uri_telefonica + '",' + oldGtwTfnoResData[i].deteccion_vox + '' +
                                ',' + oldGtwTfnoResData[i].umbral_vox + ',' + oldGtwTfnoResData[i].cola_vox + ',' + oldGtwTfnoResData[i].respuesta_automatica + '' +
                                ',' + oldGtwTfnoResData[i].periodo_tonos + ',' + oldGtwTfnoResData[i].lado + ',"' + oldGtwTfnoResData[i].origen_test + '","' + oldGtwTfnoResData[i].destino_test + '"' +
                                ',' + oldGtwTfnoResData[i].supervisa_colateral + ',' + oldGtwTfnoResData[i].tiempo_supervision + ',' + oldGtwTfnoResData[i].duracion_tono_interrup + '' +
                                ',"' + oldGtwTfnoResData[i].ats_user + '"' +
                                ');';
                        }
                        res = await ug5kdb.QueryMultiInsertSync(query);
                        var element = new Object();
                        element.oldRtId = oldGtwTfnoResData[i].idrecurso_telefono;
                        element.newRtId = res.data.insertId;
                        linkedGtwTfnoResData.push(element);
                    }
                }
                return callback(null);
            };
            var selectRadioResLista_Uris = function /*selectRadioResLista_Uris*/(callback) {
                var query = connection.query('SELECT lu.* ' +
                    'FROM emplazamientos e ' +
                    'LEFT JOIN configuraciones c ON e.configuracion_id=c.idconfiguracion ' +
                    'LEFT JOIN pasarelas p ON e.idemplazamiento=p.emplazamiento_id ' +
                    'LEFT JOIN recursos_radio rr ON p.idpasarela=rr.pasarela_id ' +
                    'LEFT JOIN lista_uris lu ON rr.idrecurso_radio=lu.recurso_radio_id ' +
                    'WHERE c.idconfiguracion=?', [idSourceConfig],
                    function(err, rows) {
                        logging.Trace(query.sql);
                        if (err || rows.length == 0) {
                            return callback(rows.length == 0 ? 'NO_DATA' : err);
                        }
                        else {
                            oldGtwRadioResLista_UrisData = rows;
                            return callback(null);
                        }
                    });
            };
            var insertNewRadioResLista_Uris = async function /*insertNewRadioResLista_Uris*/(callback) {
                var query = '';
                var res = '';
                var rrId2Insert = 0;
                for (var i = 0; i < oldGtwRadioResLista_UrisData.length; i++) {
                    if (oldGtwRadioResLista_UrisData[i].recurso_radio_id != null) {
                        for (var j = 0; j < linkedGtwRadioResData.length; j++) {
                            if (linkedGtwRadioResData[j].oldRrId == oldGtwRadioResLista_UrisData[i].recurso_radio_id)
                                rrId2Insert = linkedGtwRadioResData[j].newRrId;
                        }
                        query = 'INSERT INTO lista_uris (recurso_radio_id,uri,tipo,nivel_colateral) ' +
                            'VALUES ' +
                            '(' + rrId2Insert + ',"' + oldGtwRadioResLista_UrisData[i].uri + '","' + oldGtwRadioResLista_UrisData[i].tipo + '"' +
                            ',' + oldGtwRadioResLista_UrisData[i].nivel_colateral + '' +
                            ');';
                        res = await ug5kdb.QueryMultiInsertSync(query);
						/*var element = new Object();
						element.oldGtwId = oldGtwData[i].idpasarela;
						element.newGtwId = res.data.insertId;
						linkedGtwRadioResData.push(element);*/
                    }
                }
                return callback(null);
            };
            var selectTfnoResRangos_Ats = function /*selectTfnoResRangos_Ats*/(callback) {
                var query = connection.query('SELECT ra.* ' +
                    'FROM emplazamientos e ' +
                    'LEFT JOIN configuraciones c ON e.configuracion_id=c.idconfiguracion ' +
                    'LEFT JOIN pasarelas p ON e.idemplazamiento=p.emplazamiento_id ' +
                    'LEFT JOIN recursos_telefono rt ON p.idpasarela=rt.pasarela_id ' +
                    'LEFT JOIN rangos_ats ra ON rt.idrecurso_telefono=ra.recurso_telefonico_id ' +
                    'WHERE c.idconfiguracion=?', [idSourceConfig],
                    function(err, rows) {
                        logging.Trace(query.sql);
                        if (err || rows.length == 0) {
                            return callback(rows.length == 0 ? 'NO_DATA' : err);
                        }
                        else {
                            oldGtwTfnoResRangos_AtsData = rows;
                            return callback(null);
                        }
                    });
            };
            var insertNewTfnoResRangos_Ats = async function /*insertNewTfnoResRangos_Ats*/(callback) {
                var query = '';
                var res = '';
                var rtId2Insert = 0;
                for (var i = 0; i < oldGtwTfnoResRangos_AtsData.length; i++) {
                    if (oldGtwTfnoResRangos_AtsData[i].recurso_telefonico_id != null) {
                        for (var j = 0; j < linkedGtwTfnoResData.length; j++) {
                            if (linkedGtwTfnoResData[j].oldRtId == oldGtwTfnoResRangos_AtsData[i].recurso_telefonico_id)
                                rtId2Insert = linkedGtwTfnoResData[j].newRtId;
                        }
                        query = 'INSERT INTO rangos_ats (recurso_telefonico_id,rango_ats_inicial,rango_ats_final,tipo) ' +
                            'VALUES ' +
                            '(' + rtId2Insert + ',"' + oldGtwTfnoResRangos_AtsData[i].rango_ats_inicial + '","' + oldGtwTfnoResRangos_AtsData[i].rango_ats_final + '"' +
                            ',' + oldGtwTfnoResRangos_AtsData[i].tipo + '' +
                            ');';
                        res = await ug5kdb.QueryMultiInsertSync(query);
						/*var element = new Object();
						 element.oldGtwId = oldGtwData[i].idpasarela;
						 element.newGtwId = res.data.insertId;
						 linkedGtwRadioResData.push(element);*/
                    }
                }
                return callback(null);
            };

            // CODIGO ASÍNCRONO
            async.waterfall([
                insertNewCfg,
                selectSitesFromCfg,
                insertNewSites,
                selectGateways,
                insertNewGtws,
                selectGatewayIps,
                insertNewGtwIps,
                selectGatewayRadioRes,
                insertNewGtwRadioRes,
                selectGatewayTfnoRes,
                insertNewGtwTfnoRes,
                selectRadioResLista_Uris,
                insertNewRadioResLista_Uris,
                selectTfnoResRangos_Ats,
                insertNewTfnoResRangos_Ats
            ], function(err, result) {
                connection.end();
                f({ data: 'OK' });
            });

        }
    });
};

/********************************/
/*	FUNCTION: getFreeGateways 	*/
/*  PARAMS: 					*/
/********************************/
exports.getFreeGateways = function getFreeGateways(cfg, f) {
    var gtws = [];
    var mySql = require('mySql');
    var connection = ug5kdb.GetDbConnection();/* mySql.createConnection({
        host: gcfg.Ulises.dbhost,
        user: gcfg.Ulises.dbuser,
        password: gcfg.Ulises.dbpassword,
        database: gcfg.Ulises.dbdatabase
    });*/

    connection.connect(function(err, usrs) {
        if (err) {
            logging.Error("Error connection to 'U5K-G' database.");
        }
        else {
            

            var query = "";
            query = connection.query('SELECT b.*,a.Activa,e.name as nameSite, c.idCFG,c.name as nameCfg,c.description,c.activa,c.ts_activa FROM (SELECT * FROM CGW_CFG WHERE CFG_idCFG=?) a RIGHT JOIN' +
                ' CGW b ON a.CGW_idCGW = b.idCGW' +
                ' INNER JOIN emplazamiento e ON b.EMPLAZAMIENTO_idEMPLAZAMIENTO=e.idEMPLAZAMIENTO ' +
                ' INNER JOIN cfg c ON c.idCFG = e.CFG_idCFG ' +
                ' WHERE a.CGW_idCGW IS NULL ORDER BY nameCfg,e.name,b.name', cfg, function(err, rows, fields) {
                    logging.Trace(query.sql);
                    if (err) {
                        return f({ error: err.code, result: null });
                    }

                    if (rows.length > 0) {
                        gtws = rows;
                        logging.Trace(JSON.stringify({ error: null, result: gtws }, null, '\t'));
                    }
                    connection.end();
                    f({ error: null, result: gtws });
                });
        }
    });
};

/************************************/
/*	FUNCTION: activateConfiguration */
/*  PARAMS: 						*/
/*  REV 1.0.2 VMG					*/
/************************************/
exports.activateConfiguration = function activateConfiguration(idCFG, f) {
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
            return;
        }
        else {
            

            // Comprobar si tiene pasarealas. En caso contrario no se puede activar esta configuración
            var queryHasGateways = connection.query('SELECT COUNT(*) as cuantos ' +
                'FROM pasarelas p ' +
                'LEFT JOIN emplazamientos e ON e.idemplazamiento=p.emplazamiento_id ' +
                'LEFT JOIN configuraciones c ON c.idconfiguracion=e.configuracion_id ' +
                'WHERE c.idconfiguracion=?', idCFG,
                function(err, rows, fields) {
                    logging.Trace(queryHasGateways.sql);
                    if (!err && rows != null && rows.length > 0) {
                        if (rows[0].cuantos == 0) {
                            connection.end();
                            return f({ result: false, count: 0 });
                        }
                        else {
                            // Desactivar la configuración activa
                            var queryUpdate = connection.query('UPDATE configuraciones SET activa=0 WHERE activa=1', function(err, result) {
                                logging.Trace(queryUpdate.sql);
                                if (err) {
                                    connection.end();
                                    return f({ result: false, count: 1 });
                                }
                                // Activar la configuración
                                var queryActive = connection.query('UPDATE configuraciones SET activa=1,fecha_activacion=UTC_TIMESTAMP() WHERE idconfiguracion=?', idCFG, function(err, result) {
                                    logging.Trace(queryActive.sql);
                                    if (err) {
                                        connection.end();
                                        return f({ result: false, count: 1 });
                                    }
                                    connection.end();
                                    f({ result: true, count: 1 });
                                });
                            });
                        }
                    }
                    else {
                        connection.end();
                        return f({ result: false, count: 1 });
                    }
                });
        }
    });
};

/************************************************************************/
/*	FUNCTION: loadChangestoGtws		 									*/
/*  PARAMS: idCFG 														*/
/*          listOfGateways												*/
/*  DESC: Activa configuración en las gateways pasadas en arrayOfGtw 	*/
/************************************************************************/
exports.loadChangestoGtws = function loadChangestoGtws(idCfg, f) {
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
            return;
        }
        else {
            

            queryCgwCfg = connection.query('UPDATE pasarelas SET pendiente_actualizar=0, ultima_actualizacion=UTC_TIMESTAMP() ' +
                'WHERE pendiente_actualizar=1', function(err, result) {
                    connection.end();
                    logging.Trace(queryCgwCfg.sql);
                    if (err) {
                        return f(false);
                    }
                    f(true);
                });
        }
    });
};

/********************************/
/*	FUNCTION: gatewaysOut 		*/
/*  PARAMS: 					*/
/*  REV 1.0.2 VMG				*/
/********************************/
exports.gatewaysOut = function gatewaysOut(req, res, cfg, f) {
    var gtws = [];
    var mySql = require('mySql');
    var connection = ug5kdb.GetDbConnection();/* mySql.createConnection({
        host: gcfg.Ulises.dbhost,
        user: gcfg.Ulises.dbuser,
        password: gcfg.Ulises.dbpassword,
        database: gcfg.Ulises.dbdatabase
    });*/

    connection.connect(function(err, usrs) {
        if (err) {
            logging.Error("Error connection to 'U5K-G' database.");
        }
        else {
            
            var query = connection.query('SELECT p.idpasarela,p.nombre as name,p.ip_cpu0,p.ip_cpu1,' +
                'p.ip_virtual as ipv ' +
                'FROM pasarelas p ' +
                'LEFT JOIN emplazamientos e ON p.emplazamiento_id=e.idemplazamiento ' +
                'LEFT JOIN configuraciones c ON e.configuracion_id=c.idconfiguracion ' +
                'WHERE c.idconfiguracion=?', [cfg],
                function(err, rows, fields) {
                    connection.end();
                    logging.Trace(query.sql);
                    if (err || rows == null || rows.length == 0) {
                        return f({ error: 'NO_DATA' });
                    }
                    else {
                        return f({ data: rows });
                    }
                });
        }
    });
};

/************************************************************************/
/*	FUNCTION: activateGateways		 									*/
/*  PARAMS: idCFG 														*/
/*          listOfGateways												*/
/*  DESC: Activa configuración en las gateways pasadas en arrayOfGtw 	*/
/************************************************************************/
exports.activateGateways = function activateGateways(idCfg, arrayOfGtw, f) {
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
            return;
        }
        else {
            

            queryCgwCfg = connection.query('UPDATE CGW_CFG SET Sincro=0, LastUpdate=UTC_TIMESTAMP(), Activa=1 WHERE CFG_idCFG=? AND CGW_idCGW IN (?)', [idCfg, arrayOfGtw], function(err, result) {
                connection.end();
                logging.Trace(queryCgwCfg.sql);
                if (err) {
                    return f(false);
                }

                f(true);
            });
        }
    });
};

exports.postConfigurationFromGateway = function postConfigurationFromGateway(req, res, general, servicios, hardware, f) {
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
            

            // Crear el servicio.
            if (servicios != null && servicios.name == null)
                servicios.name = general.name + '_SERVICE';


            var slaves = [];

            async.waterfall([
                function(callback) {
                    // Localizar la gateway a partir de la ip de la CPU pasada como parámetro en el POST
                    myLibGateways.getIpv(req.params.gateway, function(result) {
                        if (result.error != null)
                            return callback(result.error);

                        //callback(null,result.idCGW);
                        if (result.ipv == -1) {	// result.data => ipv de la gateway
                            if (servicios.idSERVICIOS == null) {
                                myLibServices.postService(servicios, function(result) {
                                    servicios.idSERVICIOS = result.service.idServicios;
                                    // SI LA GATEWAY NO EXISTE EN LA CONFIGURACIÓN, SE INSERTA.
                                    myLibGateways.postGateway(req.body.idConf, false, true, general, servicios, function(result) {
                                        //idCGW = result.data.idCGW;
                                        exports.assignGatewayToConfiguration({ "CFG_idCFG": result.idCfg, "CGW_idCGW": result.data.idCGW, Activa: 1, Sincro: 2 }, function(result) {
                                            callback(null, result.data.CGW_idCGW);
                                        });
                                        //callback(null, result.data.idCGW);
                                    });
                                });
                            }
                            else {
                                myLibGateways.postGateway(req.body.idConf, false, true, general, servicios, function(result) {
                                    myLibGateways.assignGatewayToConfiguration({ "CFG_idCFG": result.idCfg, "CGW_idCGW": result.data.idCGW, Activa: 1, Sincro: 2 }, function(result) {
                                        callback(null, result.data.CGW_idCGW);
                                    });
                                    //callback(null, result.data.idCGW);
                                });
                            }
                        }
                        else {
                            // SI YA EXISTE, SE OBTIENE EL idCGW PARA ACTUALIZAR (ELIMINAR/INSERTAR) EL HARDWARE
                            //myLibHardware.RemoveHardwareFromGateway({CGW_idCGW:rows[0].idCGW,SLAVES_idSLAVES:null},function(result){
                            servicios.idSERVICIOS = result.servicio;
                            general.idCGW = result.idCGW;

                            // SE ACTUALIZAN LOS DATOS DE LA PASARELA Y SUS SERVICIOS ASIGNADOS
                            myLibGateways.putGateway(req, res, general, servicios, function(gtw) {
                                callback(null, result.idCGW);
                            });
                            //})
                        }
                    });
                }],
                function(err, idCGW) {
                    var numSlave = 0;
                    // INSERTAR CADA ESCLAVA RECIBIDA
                    async.eachSeries(hardware.slv,
                        function(s, callback) {
                            if (s.tp != -1) {	// Configurada
                                // Comprobar si la CGW <idCGW> tiene una esclava configurada en la posición <numSlave>
                                var querySlave = connection.query('SELECT SLAVES_idSLAVES FROM hardware ' +
                                    'WHERE CGW_idCGW=? AND rank=?', [idCGW, numSlave], function(err, rows, fields) {
                                        logging.Trace(querySlave.sql);

                                        s.rank = numSlave;

                                        if (err) callback(err);
                                        else if (rows != null && rows.length > 0) {
                                            var idSlave = rows[0].SLAVES_idSLAVES;

                                            //slaves[numSlave++]=idSlave;

                                            // Eliminar esta slave
                                            var updateSlave = connection.query('DELETE FROM slaves WHERE idSLAVES=?', idSlave, function(err, result) {
                                                logging.Trace(updateSlave.sql);
                                                if (err) return callback(err);

                                                //callback();	
                                            });
                                        }

                                        // Insertar la esclava con los nuevos datos recibidos
                                        var slave = {};

                                        slave.name = general.name + "_" + s.rank;
                                        slave.tp = s.tp;

                                        // Eliminar una posible slave con este nombre
                                        //var queryDelSlave=connection.query('DELETE FROM slaves WHERE name=?',slave.name,function(err,result){
                                        //	logging.Trace(queryDelSlave.sql);
                                        var queryInsertSlaves = connection.query('INSERT INTO slaves SET ?', slave, function(err, result) {
                                            logging.Trace(queryInsertSlaves.sql);
                                            if (err) callback(err);
                                            else {
                                                var hw = {};
                                                hw.CGW_idCGW = idCGW;
                                                hw.SLAVES_idSLAVES = result.insertId;
                                                hw.rank = s.rank;

                                                slaves[numSlave++] = result.insertId;

                                                // INSERTAR EL REGISTRO HARDWARE ASOCIADO A LA ESCLAVA Y A LA PASARELA
                                                var queryInsertHw = connection.query('INSERT INTO hardware SET ?', hw, function(err, result) {
                                                    logging.Trace(queryInsertHw.sql);
                                                    if (err) return callback(err);

                                                    callback();
                                                });
                                            }
                                        });
                                        //})
                                    });
                            }
                            else {
                                slaves[numSlave] = -1;

                                // Slave no configurada
                                myLibHardware.RemoveHardwareFromGateway({ CGW_idCGW: rows[0].idCGW, SLAVES_idSLAVES: null, rank: numSlave }, function(result) {
                                    numSlave++;
                                    callback();
                                });
                            }
                        },
                        function(err) {
                            connection.end();

                            f({ error: err, slaves: slaves });
                        }
                    );	// End async.each
                }
            );
        }
    });
};

exports.getSiteName = function getSiteName(cfgId, siteName, f) {
    var mySql = require('mySql');
    var connection = ug5kdb.GetDbConnection();/* mySql.createConnection({
        host: gcfg.Ulises.dbhost,
        user: gcfg.Ulises.dbuser,
        password: gcfg.Ulises.dbpassword,
        database: gcfg.Ulises.dbdatabase
    });*/

    connection.connect(function(err) {
        if (err) {
            logging.Trace("Error connention to 'U5K-G' database.");
        }
        else {
            
        }

        //var query = connection.query('SELECT idCFG,name,description,activa,DATE_FORMAT(ts_activa, "%d/%m/%Y %H:%i:%s") as ts_activa FROM CFG WHERE ??=?',['name', cfg], function(err, rows, fields) {
        var query = connection.query('SELECT idEMPLAZAMIENTO ' +
            'FROM  emplazamiento ' +
            'WHERE name=? AND cfg_idCFG=?', [siteName, cfgId], function(err, rows, fields) {
                connection.end();
                logging.Trace(query.sql);

                if (err) throw err;
                if (rows && rows.length > 0) {
                    logging.Trace(JSON.stringify({ result: rows }, null, '\t'));
                    f(rows[0]);
                }
                else
                    f(null);
            });
    });
};

/********************************************/
/*	FUNCTION: getPendingActiveConfiguration */
/*  PARAMS: 								*/
/*  REV 1.0.2 VMG							*/
/********************************************/
exports.getPendingActiveConfiguration = function getActiveConfiguration(req, res, f) {
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
            return;
        }
        else {
            

            // Desactivar la configuración activa
            var query = connection.query('SELECT c.idconfiguracion as idCFG, c.nombre as name ' +
                'FROM configuraciones c ' +
                'WHERE c.activa=1', function(err, rows, fields) {
                    connection.end();
                    logging.Trace(query.sql);
                    if (err || rows == null || rows.length == 0) {
                        return f(null);
                    }

                    return f({ idCFG: rows[0].idCFG, name: rows[0].name });
                });
        }
    });
};

/********************************************/
/*	FUNCTION: gatewaysHasResources 			*/
/*  PARAMS: 								*/
/*  REV 1.0.2 VMG							*/
/********************************************/
exports.gatewaysHasResources = function gatewaysHasResources(req, res, f) {
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
            return;
        }
        else {
            
            //Devolvemos una lista con las pasarelas de la config que necesitamos
            // con el numero de recursos radio y tfno que tiene cada una
            var query = connection.query('SELECT idpasarela,nombre,SUM(cuantos_radio) as radio, ' +
                'SUM(cuantos_telefono) as telefono ' +
                'FROM ( ' +
                '	SELECT p.idpasarela idpasarela, p.nombre NOMBRE, ' +
                '	CASE WHEN rr.pasarela_id IS NOT NULL THEN 1 ELSE 0 END as cuantos_radio, 0 cuantos_telefono ' +
                '	FROM pasarelas p ' +
                '	LEFT JOIN recursos_radio rr ON rr.pasarela_id=p.idpasarela ' +
                '	WHERE p.idpasarela IN ( ' +
                '		SELECT DISTINCT p.idpasarela ' +
                '		FROM configuraciones c ' +
                '		LEFT JOIN emplazamientos e ON c.idconfiguracion=e.configuracion_id ' +
                '		LEFT JOIN pasarelas p ON e.idemplazamiento=p.emplazamiento_id ' +
                '		WHERE c.idconfiguracion=? ' +
                '		AND p.nombre IS NOT NULL ' +
                '	) ' +
                '	UNION ALL ' +
                '	SELECT p1.idpasarela idpasarela, p1.nombre NOMBRE,  0 as cuantos_radio, ' +
                '	CASE WHEN rt.pasarela_id IS NOT NULL THEN 1 ELSE 0 END as cuantos_telefono ' +
                '	FROM pasarelas p1 ' +
                '	LEFT JOIN recursos_telefono rt ON rt.pasarela_id=p1.idpasarela ' +
                '	WHERE p1.idpasarela IN ( ' +
                '		SELECT DISTINCT p.idpasarela ' +
                '		FROM configuraciones c ' +
                '		LEFT JOIN emplazamientos e ON c.idconfiguracion=e.configuracion_id ' +
                '		LEFT JOIN pasarelas p ON e.idemplazamiento=p.emplazamiento_id ' +
                '		WHERE c.idconfiguracion=? ' +
                '		AND p1.nombre IS NOT NULL ' +
                '	) ' +
                ') resultado ' +
                'GROUP BY  resultado.idpasarela, resultado.nombre', [req.params.configuration, req.params.configuration],
                function(err, rows, fields) {
                    connection.end();
                    logging.Trace(query.sql);
                    if (err || rows == null || rows.length == 0)
                        return f({ data: null });
                    else
                        return f({ data: rows });
                });
        }
    });
};

exports.getActiveConfiguration = function getActiveConfiguration(req, res, f) {
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
            return;
        }
        else {
            

            // Desactivar la configuración activa
            var query = connection.query('SELECT c.idCFG,c.name FROM cfg c ' +
                'INNER JOIN cgw_cfg cc ON cc.CFG_idCFG=c.idCFG ' +
                'WHERE cc.activa', function(err, rows, fields) {
                    connection.end();
                    logging.Trace(query.sql);
                    if (err || rows == null || rows.length == 0) {
                        return f(null);
                    }

                    return f({ idCFG: rows[0].idCFG, name: rows[0].name });
                });
        }
    });
};

exports.resetGatewaysSynchroState = function resetGatewaysSynchroState(f) {
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
            

            var query = connection.query('UPDATE cgw_cfg SET Sincro = 3', function(err, result1) {
                if (err) {
                    logging.Trace(query.sql);
                    connection.end();
                    return f(err ? err : 'NO_DATA');
                }

                var query2 = connection.query('REPLACE cgw_estado (SELECT idCGW,EMPLAZAMIENTO_idEMPLAZAMIENTO,0 FROM cgw)', function(err, result2) {
                    if (err) {
                        logging.Trace(query2.sql);
                        connection.end();
                        return f(err ? err : 'NO_DATA');
                    }

                    connection.end();
                    logging.Trace(query2.sql);
                    f({ error: err, result: result1.affectedRows + result2.affectedRows });
                });
            });
        }
    });
};

exports.SP_cfg_v1 = function SP_cfg_v1(cfg, f) {
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
            

            var query = connection.query('SELECT c.nombre as cfg_name, p.nombre as cgw_name, rr.columna as slave, ' +
                'rr.fila as posicion, rr.nombre as resource_name, 1 as resource_tipo, rr.frecuencia as destination_name, ' +
                '"" as idRANGOS, "" as PARAMTELEF_idPARAMTELEF,"" as origen, "" as inicial, "" as final, ' +
                '"" as idUBICACIONES, rr.idrecurso_radio as RECURSOS_idRECURSO, ' +
                '(CASE ' +
                'WHEN lu.tipo="TXA" THEN lu.uri ' +
                'ELSE ""' +
                'END) as uriTxA, ' +
                '	(CASE ' +
                'WHEN lu.tipo="TXB" THEN lu.uri ' +
                'ELSE ""' +
                'END) as uriTxB, ' +
                '	(CASE ' +
                'WHEN lu.tipo="RXA" THEN lu.uri ' +
                'ELSE ""' +
                'END) as uriRxA, ' +
                '	(CASE ' +
                'WHEN lu.tipo="RXB" THEN lu.uri ' +
                'ELSE ""' +
                'END) as uriRxB, ' +
                '"" as activoTx, "" as activoRx, "" as tipo_tel, "" as uri_remota, rr.tipo_agente as tipo_rad ' +
                'FROM configuraciones c ' +
                'LEFT JOIN emplazamientos e ON c.idconfiguracion=e.configuracion_id ' +
                'LEFT JOIN pasarelas p ON e.idemplazamiento=p.emplazamiento_id ' +
                'LEFT JOIN recursos_radio rr ON p.idpasarela=rr.pasarela_id ' +
                'LEFT JOIN lista_uris lu ON rr.idrecurso_radio=lu.recurso_radio_id ' +
                'WHERE c.idconfiguracion=? ' +
                'AND p.nombre is NOT NULL ' +
                'AND rr.nombre is NOT NULL ' +
                'UNION ' +
                'SELECT c.nombre as cfg_name, p.nombre as cgw_name, rt.columna as slave, rt.fila as posicion, ' +
                'rt.nombre as resource_name, 2 as resource_tipo, "" as destination_name, rats.idrangos_ats as idRANGOS, ' +
                'rats.recurso_telefonico_id as PARAMTELEF_idPARAMTELEF, "" as origen, rats.rango_ats_inicial as inicial, ' +
                'rats.rango_ats_final as final, "" as idUBICACIONES, rt.idrecurso_telefono as RECURSOS_idRECURSO, ' +
                '"" as uriTxA, "" as uriTxB, "" as uriRxA, "" as uriRxB, "" as activoTx, "" as activoRx, ' +
                'rt.tipo_interfaz_tel as tipo_tel, rt.uri_telefonica as uri_remota, "" as tipo_rad ' +
                'FROM configuraciones c ' +
                'LEFT JOIN emplazamientos e ON c.idconfiguracion=e.configuracion_id ' +
                'LEFT JOIN pasarelas p ON e.idemplazamiento=p.emplazamiento_id ' +
                'LEFT JOIN recursos_telefono rt ON p.idpasarela=rt.pasarela_id ' +
                'LEFT JOIN rangos_ats rats ON rt.idrecurso_telefono=rats.recurso_telefonico_id ' +
                'WHERE c.idconfiguracion=? ' +
                'AND p.nombre is NOT NULL ' +
                'AND rt.nombre is NOT NULL ' +
                'ORDER BY cgw_name,slave,posicion', [cfg, cfg], function(err, rows) {
                    connection.end();
                    if (err) {
                        logging.Trace(query.sql);
                        return f(err ? err : 'NO_DATA');
                    }

                    f({ error: err, result: rows });
                });
        }
    });
};

exports.SP_cfg = async function SP_cfg(cfg, f) {
    logging.Trace('SP_cfg');
    var report = require('./get_cfg_report.js');
    await report.CfgReport(cfg, f);
};

exports.getListOfGateways = function getListOfGateways(f) {
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
            

            var query = connection.query('SELECT * FROM listOfGateways', function(err, rows) {
                connection.end();
                if (err) {
                    logging.Trace(query.sql);
                    return f(err ? err : 'NO_DATA');
                }

                f({ error: err, result: rows });
            });
        }
    });
};

/****************************************/
/*	FUNCTION: setUpdateGateway 			*/
/*  PARAMS: 							*/
/*  REV 1.0.2 VMG						*/
/****************************************/
exports.setUpdateGateway = function setUpdateGateway(gtw, f) {
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
            
            var query = connection.query('UPDATE pasarelas SET pendiente_actualizar=1 ' +
                'WHERE idpasarela=?', gtw.Gateway, function(err, rows) {
                    connection.end();
                    if (err) {
                        logging.Trace(query.sql);
                        return f(err ? err : 'NO_DATA');
                    }
                    else
                        return f({ error: err, result: 'UPDATED' });
                });
        }
    });
};

exports.putListOfGateways = function putListOfGateways(gtw, f) {
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
            

            var query;
            if (gtw.Gateway != null) {
                query = connection.query('INSERT INTO listOfGateways SET ?', gtw, function(err, result) {
                    connection.end();
                    if (err) {
                        logging.Trace(query.sql);
                        return f(err ? err : 'NO_DATA');
                    }

                    f({ error: err, result: result.insertId });
                });
            }
            else {
                query = connection.query('TRUNCATE TABLE listOfGateways', function(err, result) {
                    connection.end();
                    if (err) {
                        logging.Trace(query.sql);
                        return f(err ? err : 'NO_DATA');
                    }

                    f({ error: err, result: null });
                });
            }
        }
    });
};

/********************************************/
/*	FUNCTION: checkExportGtwNamesOrIpDup 	*/
/*  PARAMS: 								*/
/*											*/
/*  REV 1.0.2 VMG							*/
/********************************************/
exports.checkExportGtwNamesOrIpDup = function(idcfg, idSite, newCgwData, f) {
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
            
            var query = connection.query('SELECT COUNT(*) as cuantos ' +
                'FROM pasarelas p ' +
                'LEFT JOIN emplazamientos e ON p.emplazamiento_id=e.idemplazamiento ' +
                'LEFT JOIN configuraciones c ON e.configuracion_id=c.idconfiguracion ' +
                'WHERE c.idconfiguracion=? ' +
                'AND ' +
                '(p.nombre=? ' +
                'OR p.ip_cpu0=? ' +
                'OR p.ip_cpu1=?)',
                [idcfg, newCgwData.general.name, newCgwData.general.cpus[0].ipb, newCgwData.general.cpus[1].ipb],
                function(err, rows) {
                    connection.end();
                    if (err) {
                        logging.Trace(query.sql);
                        return f(err ? err : 'ERROR');
                    }
                    else if (rows[0].cuantos > 0)
                        return f({ data: 'DUPLICATED' });
                    else
                        return f({ data: 'OK' });
                });

        }
    });
};
/********************************************/
/*	FUNCTION: postConfigurationFromJsonFile */
/*  PARAMS: 								*/
/*											*/
/*  REV 1.0.2 VMG							*/
/********************************************/
exports.postConfigurationFromJsonFile = function(idcfg, idSite, newCgwData, f) {
    var mySql = require('mySql');
    var connection = ug5kdb.GetDbConnection();/* mySql.createConnection({
        host: gcfg.Ulises.dbhost,
        user: gcfg.Ulises.dbuser,
        password: gcfg.Ulises.dbpassword,
        database: gcfg.Ulises.dbdatabase,
        multipleStatements: true
    });*/

    connection.connect(function(err) {
        if (err) {
            logging.Error("Error connection to 'U5K-G' database.");
        }
        else {
            
            var newInsertCgwId = 0;
            var resRadioId = [];
            var resPhoneId = [];
            var flagResources = { resRadio: false, resTfno: false };

            //async.waterfall([
            //    insertGtwData,
            //    insertGtwRadioData,
            //    insertGtwPhoneData,
            //    insertGtwIpListData,
            //    insertGtwRadioUriListData,
            //    insertGtwRadioBlackWhiteUriListData,
            //    insertGtwPhoneATSRangeData
            //], function (err, result) {
            //    connection.end();
            //    f(result, flagResources);
            //    });

            var insertGtwData = function /*insertGtwData*/(callback) {
                var query = connection.query('INSERT INTO pasarelas (emplazamiento_id,nombre,ip_virtual,ultima_actualizacion,' +
                    'ip_cpu0,ip_gtw0,mask_cpu0,ip_cpu1,ip_gtw1,mask_cpu1,puerto_sip,periodo_supervision,puerto_servicio_snmp,' +
                    'puerto_snmp,snmpv2,comunidad_snmp,nombre_snmp,localizacion_snmp,contacto_snmp,puerto_servicio_web,' +
                    'tiempo_sesion,puerto_rtsp,servidor_rtsp,servidor_rtspb) ' +
                    'VALUES (?,?,?,NOW(),?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
                    [parseInt(idSite), newCgwData.general.name, newCgwData.general.ipv,
                    newCgwData.general.cpus[0].ipb, newCgwData.general.cpus[0].ipg, newCgwData.general.cpus[0].msb,
                    newCgwData.general.cpus[1].ipb, newCgwData.general.cpus[1].ipg, newCgwData.general.cpus[1].msb,
                    newCgwData.servicios.sip.PuertoLocalSIP, newCgwData.servicios.sip.PeriodoSupervisionSIP,
                    newCgwData.servicios.snmp.sport, newCgwData.servicios.snmp.snmpp, newCgwData.servicios.snmp.agv2,
                    newCgwData.servicios.snmp.agcomm, newCgwData.servicios.snmp.agname, newCgwData.servicios.snmp.agloc,
                    newCgwData.servicios.snmp.agcont, newCgwData.servicios.web.wport, newCgwData.servicios.web.stime,
                    newCgwData.servicios.grab.rtsp_port, newCgwData.servicios.grab.rtsp_ip, newCgwData.servicios.grab.rtspb_ip],
                    function(err, result) {
                        logging.Trace(query.sql);
                        if (err) {
                            return f(err ? err : 'NO_DATA');
                        }
                        else {
                            var newInsertCgwId = result.insertId;
                            for (var i = 0; i < newCgwData.recursos.length; i++) {
                                if (newCgwData.recursos[i].Radio_o_Telefonia == 1)
                                    flagResources.resRadio = true;
                                if (newCgwData.recursos[i].Radio_o_Telefonia == 2)
                                    flagResources.resTfno = true;
                            }
                            return callback(null, newInsertCgwId, flagResources);
                        }
                    });
            };
            var insertGtwRadioData = async function /*insertGtwRadioData*/(newInsertCgwId, flagResources, callback) {
                var queryString = '';
                if (flagResources.resRadio) {
                    for (var i = 0; i < newCgwData.recursos.length; i++) {
                        if (newCgwData.recursos[i].Radio_o_Telefonia == 1) {
                            var adGain = 0;
                            var daGain = 0;
                            if (newCgwData.recursos[i].hardware.AD_AGC == 1)
                                adGain = 'null';
                            else
                                adGain = parseFloat(newCgwData.recursos[i].hardware.AD_Gain) / 10;
                            if (newCgwData.recursos[i].hardware.DA_AGC == 1)
                                daGain = 'null';
                            else
                                daGain = parseFloat(newCgwData.recursos[i].hardware.DA_Gain) / 10;

                            queryString = 'INSERT INTO recursos_radio (pasarela_id,fila,columna,nombre,codec,' +
                                'clave_registro,frecuencia,ajuste_ad,ajuste_da,precision_audio,tipo_agente,indicacion_entrada_audio,' +
                                'indicacion_salida_audio,metodo_bss,prioridad_ptt,prioridad_sesion_sip,climax_bss,retraso_interno_grs,' +
                                'evento_ptt_squelch,habilita_grabacion,max_jitter,min_jitter,umbral_vad,tiempo_max_ptt,ventana_bss,' +
                                'tipo_climax,retardo_fijo_climax,cola_bss_sqh,retardo_jitter,metodo_climax,restriccion_entrantes,tabla_bss_id) ' +
                                'VALUES (' + newInsertCgwId + ',' + newCgwData.recursos[i].NumDispositivoSlot + ',' +
                                '' + newCgwData.recursos[i].SlotPasarela + ',"' + newCgwData.recursos[i].IdRecurso + '",' +
                                '' + newCgwData.recursos[i].Codec + ',"' + newCgwData.recursos[i].szClave + '",' +
                                '' + newCgwData.recursos[i].radio.colateral.name + ',' + adGain + ',' +
                                '' + daGain + ',' + newCgwData.recursos[i].radio.iPrecisionAudio + ',' +
                                '' + newCgwData.recursos[i].radio.tipo + ',' + newCgwData.recursos[i].radio.sq + ',' +
                                '' + newCgwData.recursos[i].radio.ptt + ',' + newCgwData.recursos[i].radio.metodoBss + ',' +
                                '' + newCgwData.recursos[i].radio.iPttPrio + ',' +
                                '' + newCgwData.recursos[i].radio.iSesionPrio + ',' + newCgwData.recursos[i].radio.bss + ',' +
                                '' + newCgwData.recursos[i].radio.tGRSid + ',' + newCgwData.recursos[i].radio.evtPTT + ',' +
                                '' + newCgwData.recursos[i].radio.iEnableGI + ',' + newCgwData.recursos[i].Buffer_jitter.max + ',' +
                                '' + newCgwData.recursos[i].Buffer_jitter.min + ',' + newCgwData.recursos[i].radio.umbralVad + ',' +
                                '' + newCgwData.recursos[i].radio.tiempoPtt + ',' +
                                '' + newCgwData.recursos[i].radio.tmVentanaRx + ',' + newCgwData.recursos[i].radio.climaxDelay + ',' +
                                '' + newCgwData.recursos[i].radio.tmRetardoFijo + ',' + newCgwData.recursos[i].radio.retrasoSqOff + ',' +
                                '' + newCgwData.recursos[i].radio.tjbd + ',' + newCgwData.recursos[i].radio.iModoCalculoClimax + ',' +
                                '' + newCgwData.recursos[i].restriccion + ',0)';
                            //Falta tabla_bss_id
                            res = await ug5kdb.QueryMultiInsertSync(queryString);
                            resRadioId.push(res.data.insertId);
                        }
                    }
                    return callback(null, newInsertCgwId, flagResources, resRadioId);
                }
                else
                    return callback(null, newInsertCgwId, flagResources, resRadioId);
            };
            var insertGtwPhoneData = async function /*insertGtwPhoneData*/(newInsertCgwId, flagResources, resRadioId, callback) {
                var queryString = '';
                if (flagResources.resTfno) {
                    for (var i = 0; i < newCgwData.recursos.length; i++) {
                        if (newCgwData.recursos[i].Radio_o_Telefonia == 2) {
                            var adGain = 0;
                            var daGain = 0;
                            if (newCgwData.recursos[i].hardware.AD_AGC == 1)
                                adGain = 'null';
                            else
                                adGain = parseFloat(newCgwData.recursos[i].hardware.AD_Gain) / 10;
                            if (newCgwData.recursos[i].hardware.DA_AGC == 1)
                                daGain = 'null';
                            else
                                daGain = parseFloat(newCgwData.recursos[i].hardware.DA_Gain) / 10;
                            queryString = 'INSERT INTO recursos_telefono (pasarela_id,fila,columna,nombre,codec,' +
                                'clave_registro,ajuste_ad,ajuste_da,precision_audio,tipo_interfaz_tel,' +
                                'deteccion_vox,umbral_vox,cola_vox,respuesta_automatica,periodo_tonos,lado,origen_test,' +
                                'destino_test,supervisa_colateral,tiempo_supervision,duracion_tono_interrup,uri_telefonica,ats_user) ' +
                                'VALUES (' + newInsertCgwId + ',' + newCgwData.recursos[i].NumDispositivoSlot + ',' +
                                '' + newCgwData.recursos[i].SlotPasarela + ',"' + newCgwData.recursos[i].IdRecurso + '",' +
                                '' + newCgwData.recursos[i].Codec + ',"' + newCgwData.recursos[i].szClave + '",' +
                                '' + adGain + ',' +
                                '' + daGain + ',1,' + newCgwData.recursos[i].telefonia.tipo + ',' +
                                '' + newCgwData.recursos[i].telefonia.detect_vox + ',' + newCgwData.recursos[i].telefonia.umbral_vox + ',' +
                                '' + newCgwData.recursos[i].telefonia.tm_inactividad + ',' + newCgwData.recursos[i].telefonia.r_automatica + ',' +
                                '' + newCgwData.recursos[i].telefonia.it_release + ',' + newCgwData.recursos[i].telefonia.lado + ',' +
                                '"' + newCgwData.recursos[i].telefonia.no_test_local + '","' + newCgwData.recursos[i].telefonia.no_test_remoto + '",' +
                                '' + newCgwData.recursos[i].telefonia.superv_options + ',' + newCgwData.recursos[i].telefonia.tm_superv_options + ',' +
                                '' + newCgwData.recursos[i].telefonia.iT_Int_Warning + ',"' + newCgwData.recursos[i].telefonia.uri_remota + '"' +
                                ',"' + newCgwData.recursos[i].telefonia.ats_user + '"' +
                                ' )';
                            //Falta tabla_bss_id
                            res = await ug5kdb.QueryMultiInsertSync(queryString);
                            resPhoneId.push(res.data.insertId);
                        }
                    }
                    return callback(null, newInsertCgwId, flagResources, resRadioId, resPhoneId);
                }
                else
                    return callback(null, newInsertCgwId, flagResources, resRadioId, resPhoneId);
            };
            var insertGtwIpListData = async function /*insertGtwIpListData*/(newInsertCgwId, flagResources, resRadioId, resPhoneId, callback) {
                var queryString = '';
                var i = 0;
                for (i = 0; i < newCgwData.servicios.sip.proxys.length; i++) {
                    if (newCgwData.servicios.sip.proxys[i].ip != '') {
                        queryString = 'INSERT INTO lista_ips (pasarela_id,ip,tipo,selected) ' +
                            'VALUES (' + newInsertCgwId + ',"' + newCgwData.servicios.sip.proxys[i].ip + '","PRX"' +
                            ',' + newCgwData.servicios.sip.proxys[i].selected + ')';
                        //Falta tabla_bss_id
                        res = await ug5kdb.QueryMultiInsertSync(queryString);
                    }
                }
                for (i = 0; i < newCgwData.servicios.sip.registrars.length; i++) {
                    if (newCgwData.servicios.sip.registrars[i].ip != '') {
                        queryString = 'INSERT INTO lista_ips (pasarela_id,ip,tipo,selected) ' +
                            'VALUES (' + newInsertCgwId + ',"' + newCgwData.servicios.sip.registrars[i].ip + '","REG"' +
                            ',' + newCgwData.servicios.sip.registrars[i].selected + ')';
                        //Falta tabla_bss_id
                        res = await ug5kdb.QueryMultiInsertSync(queryString);
                    }
                }
                for (i = 0; i < newCgwData.servicios.sincr.servidores.length; i++) {
                    if (newCgwData.servicios.sincr.servidores[i].ip != '') {
                        queryString = 'INSERT INTO lista_ips (pasarela_id,ip,tipo,selected) ' +
                            'VALUES (' + newInsertCgwId + ',"' + newCgwData.servicios.sincr.servidores[i].ip + '","NTP"' +
                            ',' + newCgwData.servicios.sincr.servidores[i].selected + ')';
                        //Falta tabla_bss_id
                        res = await ug5kdb.QueryMultiInsertSync(queryString);
                    }
                }
                for (i = 0; i < newCgwData.servicios.snmp.traps.length; i++) {
                    if (newCgwData.servicios.snmp.traps[i].ip != '') {
                        var version = 'TRPV1';
                        if (newCgwData.servicios.snmp.traps[i].substr(0, 1) == '2')
                            version = 'TRPV2';
                        queryString = 'INSERT INTO lista_ips (pasarela_id,ip,tipo,selected) ' +
                            'VALUES (' + newInsertCgwId + ',"' + newCgwData.servicios.snmp.traps[i].ip + '","' + version + '"' +
                            ',' + newCgwData.servicios.snmp.traps[i].selected + ')';
                        //Falta tabla_bss_id
                        res = await ug5kdb.QueryMultiInsertSync(queryString);
                    }
                }
                return callback(null, newInsertCgwId, flagResources, resRadioId, resPhoneId);
            };
            //Enganchar recurso radio antiguo con el nuevo insertado
            var insertGtwRadioUriListData = async function /*insertGtwRadioUriListData*/(newInsertCgwId, flagResources, resRadioId, resPhoneId, callback) {
                var queryString = '';
                var k = 0;
                if (flagResources.resRadio) {
                    for (var i = 0; i < newCgwData.recursos.length; i++) {
                        var colOdd = 1;
                        var colPair = 2;
                        if (newCgwData.recursos[i].Radio_o_Telefonia == 1) {
                            for (var j = 0; j < newCgwData.recursos[i].radio.colateral.emplazamientos.length; j++) {
                                if (newCgwData.recursos[i].radio.colateral.emplazamientos[j].uriTxA != '') {
                                    queryString = 'INSERT INTO lista_uris (recurso_radio_id,uri,tipo,nivel_colateral) ' +
                                        'VALUES (' + resRadioId[k] + ',' +
                                        '"' + newCgwData.recursos[i].radio.colateral.emplazamientos[j].uriTxA.substring(4, newCgwData.recursos[i].radio.colateral.emplazamientos[j].uriTxA.length) + '"' +
                                        ',"TXA",' + (colOdd) + ')';
                                    res = await
                                        ug5kdb.QueryMultiInsertSync(queryString);
                                }
                                if (newCgwData.recursos[i].radio.colateral.emplazamientos[j].uriTxB != '') {
                                    queryString = 'INSERT INTO lista_uris (recurso_radio_id,uri,tipo,nivel_colateral) ' +
                                        'VALUES (' + resRadioId[k] + ',' +
                                        '"' + newCgwData.recursos[i].radio.colateral.emplazamientos[j].uriTxB.substring(4, newCgwData.recursos[i].radio.colateral.emplazamientos[j].uriTxB.length) + '"' +
                                        ',"TXB",' + (colPair) + ')';
                                    res = await
                                        ug5kdb.QueryMultiInsertSync(queryString);
                                }
                                if (newCgwData.recursos[i].radio.colateral.emplazamientos[j].uriRxA != '') {
                                    queryString = 'INSERT INTO lista_uris (recurso_radio_id,uri,tipo,nivel_colateral) ' +
                                        'VALUES (' + resRadioId[k] + ',' +
                                        '"' + newCgwData.recursos[i].radio.colateral.emplazamientos[j].uriRxA.substring(4, newCgwData.recursos[i].radio.colateral.emplazamientos[j].uriRxA.length) + '"' +
                                        ',"RXA",' + colOdd + ')';
                                    res = await
                                        ug5kdb.QueryMultiInsertSync(queryString);
                                }
                                if (newCgwData.recursos[i].radio.colateral.emplazamientos[j].uriRxB != '') {
                                    queryString = 'INSERT INTO lista_uris (recurso_radio_id,uri,tipo,nivel_colateral) ' +
                                        'VALUES (' + resRadioId[k] + ',' +
                                        '"' + newCgwData.recursos[i].radio.colateral.emplazamientos[j].uriRxB.substring(4, newCgwData.recursos[i].radio.colateral.emplazamientos[j].uriRxB.length) + '"' +
                                        ',"RXB",' + (colPair) + ')';
                                    res = await
                                        ug5kdb.QueryMultiInsertSync(queryString);
                                }
                                colPair = colPair + 2;
                                colOdd = colOdd + 2;
                            }
                            k++;
                        }
                    }
                    return callback(null, newInsertCgwId, flagResources, resRadioId, resPhoneId);
                }
                else
                    return callback(null, newInsertCgwId, flagResources, resRadioId, resPhoneId);
            };
            //Enganchar recurso radio antiguo con el nuevo insertado
            var insertGtwRadioBlackWhiteUriListData = async function /*insertGtwRadioBlackWhiteUriListData*/(newInsertCgwId, flagResources, resRadioId, resPhoneId, callback) {
                var queryString = '';
                var k = 0;
                if (flagResources.resRadio) {
                    for (var i = 0; i < newCgwData.recursos.length; i++) {
                        if (newCgwData.recursos[i].Radio_o_Telefonia == 1) {
                            for (var j = 0; j < newCgwData.recursos[i].negra.length; j++) {
                                if (newCgwData.recursos[i].negra[j] != '') {
                                    queryString = 'INSERT INTO lista_uris (recurso_radio_id,uri,tipo,nivel_colateral) ' +
                                        'VALUES (' + resRadioId[k] + ',' +
                                        '"' + newCgwData.recursos[i].negra[j] + '"' +
                                        ',"LSN",0)';
                                    res = await
                                        ug5kdb.QueryMultiInsertSync(queryString);
                                }
                            }
                            for (j = 0; j < newCgwData.recursos[i].blanca.length; j++) {
                                if (newCgwData.recursos[i].blanca[j] != '') {
                                    queryString = 'INSERT INTO lista_uris (recurso_radio_id,uri,tipo,nivel_colateral) ' +
                                        'VALUES (' + resRadioId[k] + ',' +
                                        '"' + newCgwData.recursos[i].blanca[j] + '"' +
                                        ',"LSB",0)';
                                    res = await
                                        ug5kdb.QueryMultiInsertSync(queryString);
                                }
                            }
                            k++;
                        }
                    }
                    return callback(null, newInsertCgwId, flagResources, resRadioId, resPhoneId);
                }
                else
                    return callback(null, newInsertCgwId, flagResources, resRadioId, resPhoneId);
            };
            //Enganchar recurso radio antiguo con el nuevo insertado
            var insertGtwPhoneATSRangeData = async function /*insertGtwPhoneATSRangeData*/(newInsertCgwId, flagResources, resRadioId, resPhoneId, callback) {
                var queryString = '';
                var k = 0;
                if (flagResources.resTfno) {
                    for (var i = 0; i < newCgwData.recursos.length; i++) {
                        if (newCgwData.recursos[i].Radio_o_Telefonia == 2) {
                            for (var j = 0; j < newCgwData.recursos[i].telefonia.ats_rangos_org.length; j++) {
                                if (newCgwData.recursos[i].telefonia.ats_rangos_org[j].inicial != '' &&
                                    newCgwData.recursos[i].telefonia.ats_rangos_org[j].final != '') {
                                    queryString = 'INSERT INTO rangos_ats (recurso_telefonico_id,rango_ats_inicial,rango_ats_final,tipo) ' +
                                        'VALUES (' + resPhoneId[k] + ',' +
                                        '"' + newCgwData.recursos[i].telefonia.ats_rangos_org[j].inicial + '"' +
                                        ',"' + newCgwData.recursos[i].telefonia.ats_rangos_org[j].final + '"' +
                                        ',0)';//Origen
                                    res = await
                                        ug5kdb.QueryMultiInsertSync(queryString);
                                }
                            }
                            for (j = 0; j < newCgwData.recursos[i].telefonia.ats_rangos_dst.length; j++) {
                                if (newCgwData.recursos[i].telefonia.ats_rangos_dst[j].inicial != '' &&
                                    newCgwData.recursos[i].telefonia.ats_rangos_dst[j].final != '') {
                                    queryString = 'INSERT INTO rangos_ats (recurso_telefonico_id,rango_ats_inicial,rango_ats_final,tipo) ' +
                                        'VALUES (' + resPhoneId[k] + ',' +
                                        '"' + newCgwData.recursos[i].telefonia.ats_rangos_dst[j].inicial + '"' +
                                        ',"' + newCgwData.recursos[i].telefonia.ats_rangos_dst[j].final + '"' +
                                        ',1)';//Destino
                                    res = await
                                        ug5kdb.QueryMultiInsertSync(queryString);
                                }
                            }
                            k++;
                        }
                    }
                    return callback(null, newInsertCgwId, flagResources, resRadioId, resPhoneId);
                }
                else
                    return callback(null, newInsertCgwId, flagResources, resRadioId, resPhoneId);
            };

            async.waterfall([
                insertGtwData,
                insertGtwRadioData,
                insertGtwPhoneData,
                insertGtwIpListData,
                insertGtwRadioUriListData,
                insertGtwRadioBlackWhiteUriListData,
                insertGtwPhoneATSRangeData
            ], function(err, result) {
                connection.end();
                f(result, flagResources);
            });

        }
    });
};

exports.postConfigurationFromJsonFileOld = function(idcfg, idSite, config, f) {
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
            

            var slaves = [];
            var estadoPasarela = 0;//-1: Error || 0: OK || 1: Nombre duplicado || 2: Ips duplicadas

            async.waterfall([
                function(callback) {
                    // Buscar config.general.ipv en la bd
                    // Si existe no se genera la importación y mensaje de error o se borra la gtw
                    // existente
                    var query = connection.query('SELECT COUNT(name) as cuantos ' +
                        'FROM cgw ' +
                        'WHERE idCGW IN ( ' +
                        'SELECT CGW_idCGW ' +
                        'FROM cgw_cfg ' +
                        'WHERE CFG_idCFG = ?) ' +
                        'AND name LIKE ?', [idcfg, config.general.name],
                        function(err, rows) {
                            if (err)
                                callback(err, -1);
                            else if (rows[0].cuantos != 0) {
                                estadoPasarela = 1;//1: Nombre duplicado
                                config.general.name = config.general.name + '(Copia)';
                            }

                            var query = connection.query(
                                'SELECT c.ipb ' +
                                'FROM cpu c ' +
                                'LEFT JOIN cgw_cfg c2 ON c2.CGW_idCGW = c.CGW_idCGW ' +
                                'LEFT JOIN cfg c3 ON c3.idCFG = c2.CFG_idCFG ' +
                                'WHERE c3.idCFG = ?', idcfg,
                                function(err, rows) {
                                    if (err)
                                        callback(err, -1);
                                    else if (rows != 0) {
                                        //CAMBIAR EL VALOR DE LAS IPS!!!!!
                                        for (var i = 0; i < rows.length; i++) {
                                            for (var j = 0; j < 2; j++) {
                                                if (rows[i].ipb == config.general.cpus[j].ipb)
                                                    config.general.cpus[j].ipb = generaIp4ImportJson(rows, config.general.cpus[j].ipb);
                                                estadoPasarela = 2; //2: Ip duplicada
                                            }
                                        }
                                    }

                                    // CREAR SELECT PARA OBTENER NOMBRE LA CONFIG A PARTIR DE idCfg
                                    //
                                    query = connection.query('SELECT name FROM cfg WHERE idCFG=?', idcfg, function(err, rows) {
                                        if (err == null) {
                                            config.idConf = rows[0].name;
                                            // CREAR SELECT PARA OBTENER NOMBRE DEL EMPLAZAMIENTO A PARTIR DE idSite
                                            //
                                            query = connection.query('SELECT name FROM emplazamiento WHERE idEMPLAZAMIENTO=?', idSite, function(err, rows) {
                                                if (err == null) {
                                                    config.general.emplazamiento = rows[0].name;
                                                    // Crear el servicio.
                                                    //config.servicios.name=config.servicios.name + '_IMPORTED_SERVICE';
                                                    myLibServices.postService(config.servicios, function(result) {
                                                        config.servicios.idSERVICIOS = result.service.idSERVICIOS;
                                                        // SI LA GATEWAY NO EXISTE EN LA CONFIGURACIÓN, SE INSERTA.
                                                        myLibGateways.postGateway(config.idConf, false, true, config.general, config.servicios, function(result) {
                                                            myLibGateways.assignGatewayToConfiguration({
                                                                "CFG_idCFG": result.idCfg,
                                                                "CGW_idCGW": result.data.idCGW,
                                                                Activa: 1,
                                                                Sincro: 2
                                                            }, function(result) {
                                                                callback(null, result.data.CGW_idCGW);
                                                            });
                                                        });
                                                    });
                                                }
                                                else
                                                    callback(err);
                                            });
                                        }
                                        else
                                            callback(err);
                                    });
                                });
                        });
                }],
                function(err, idCGW) {
                    if (err != null || idCGW == -1)
                        f({ error: err != null ? err : -1, slaves: null });

                    var numSlave = 0;
                    // INSERTAR CADA ESCLAVA RECIBIDA
                    async.eachSeries(config.hardware.slv,
                        function(s, callback) {
                            if (s.tp != -1) {	// Configurada
                                // Comprobar si la CGW <idCGW> tiene una esclava configurada en la posición <numSlave>
                                var querySlave = connection.query('SELECT SLAVES_idSLAVES FROM hardware ' +
                                    'WHERE CGW_idCGW=? AND rank=?', [idCGW, numSlave], function(err, rows, fields) {
                                        logging.Trace(querySlave.sql);

                                        s.rank = numSlave;

                                        if (err) callback(err);
                                        else if (rows != null && rows.length > 0) {
                                            var idSlave = rows[0].SLAVES_idSLAVES;

                                            //slaves[numSlave++]=idSlave;

                                            // Eliminar esta slave
                                            var updateSlave = connection.query('DELETE FROM slaves WHERE idSLAVES=?', idSlave, function(err, result) {
                                                logging.Trace(updateSlave.sql);
                                                if (err) return callback(err);

                                                //callback();	
                                            });
                                        }

                                        // Insertar la esclava con los nuevos datos recibidos
                                        var slave = {};

                                        slave.name = config.general.name + "_" + s.rank;
                                        slave.tp = s.tp;

                                        // Eliminar una posible slave con este nombre
                                        //var queryDelSlave=connection.query('DELETE FROM slaves WHERE name=?',slave.name,function(err,result){
                                        //logging.Trace(queryDelSlave.sql);
                                        var queryInsertSlaves = connection.query('INSERT INTO slaves SET ?', slave, function(err, result) {
                                            logging.Trace(queryInsertSlaves.sql);
                                            if (err) callback(err);
                                            else {
                                                var hw = {};
                                                hw.CGW_idCGW = idCGW;
                                                hw.SLAVES_idSLAVES = result.insertId;
                                                hw.rank = s.rank;

                                                slaves[numSlave++] = result.insertId;

                                                // INSERTAR EL REGISTRO HARDWARE ASOCIADO A LA ESCLAVA Y A LA PASARELA
                                                var queryInsertHw = connection.query('INSERT INTO hardware SET ?', hw, function(err, result) {
                                                    logging.Trace(queryInsertHw.sql);
                                                    if (err) return callback(err);

                                                    callback();
                                                });
                                            }
                                        });
                                        //})
                                    });
                            }
                            else {
                                slaves[numSlave] = -1;

                                // Slave no configurada
                                myLibHardware.RemoveHardwareFromGateway({ CGW_idCGW: rows[0].idCGW, SLAVES_idSLAVES: null, rank: numSlave }, function(result) {
                                    numSlave++;
                                    callback();
                                });
                            }
                        },
                        function(err) {
                            connection.end();

                            f({ error: err, slaves: slaves });
                        }
                    );	// End async.each
                }
            );
        }
    });
};

function generaIp4ImportJson(ipList, originalIp) {
    var k = 1;
    var incIpDigit = 0;
    var newIp = originalIp.split(".");
    var noNewIpFound = false;
    do {
        if (parseInt(newIp[3]) < 255) {
            incIpDigit = parseInt(newIp[3]) + k;
            newIp = newIp[0] + '.' + newIp[1] + '.' + newIp[2] + '.' + incIpDigit.toString();
        }

        for (var i = 0; i < ipList.length; i++) {
            if (newIp == ipList[i]) {
                noNewIpFound = false;
                break;
            }
            else
                noNewIpFound = true;
        }
    } while (!noNewIpFound);

    return newIp;
}
