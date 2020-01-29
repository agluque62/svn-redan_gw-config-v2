var myLibGateways = require('./gateways.js');

var async = require('async');

var logging = require('./nu-log.js');

/** AGL */
var gcfg = require('../configUlises.json');
var ug5kdb = require('./ug5kdb.js');

/****************************/
/*	FUNCTION: getSites	 	*/
/*  PARAMS: req,			*/
/*			res,			*/
/*			f  				*/
/****************************/
exports.getSites = function getSites(req, res, f) {
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
            

            //TODO query para los sites filtrando solo por la config que necesitamos
            var query = connection.query('SELECT e.*,c.name as nameCfg FROM emplazamiento e ' +
                'INNER JOIN cfg c ON c.idCFG = e.cfg_idCFG ' +
                'ORDER BY c.name', function(err, rows, fields) {
                    logging.Trace(query.sql);
                    connection.end();
                    if (err)
                        f({ error: err });
                    else if (rows == null || rows.length == 0)
                        f({ error: err, data: 'NO_DATA' });
                    else
                        f({ error: err, data: rows });
                });
        }
    });
};

/********************************/
/*	FUNCTION: getSites4Config	*/
/*  PARAMS: req,				*/
/*			res,				*/
/*			idCfg, 				*/
/*			f  					*/
/*  REV 1.0.2 VMG				*/
/********************************/
exports.getSites4Config = function getSites4Config(req, res, idCfg, f) {
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
            

            //TODO query para los sites filtrando solo por la config que necesitamos
            var query = connection.query('SELECT e.idemplazamiento as idEMPLAZAMIENTO,e.configuracion_id as cfg_idCFG, ' +
                'e.nombre as name,c.nombre as nameCfg ' +
                'FROM emplazamientos e ' +
                'LEFT JOIN configuraciones c ON e.configuracion_id=c.idconfiguracion ' +
                'WHERE e.configuracion_id=?', [idCfg], function(err, rows, fields) {
                    logging.Trace(query.sql);
                    connection.end();
                    if (err)
                        f({ error: err });
                    else if (rows == null || rows.length == 0)
                        f({ error: err, data: 'NO_DATA' });
                    else
                        f({ error: err, data: rows });
                });
        }
    });
};

/************************************/
/*	FUNCTION: postSite 				*/
/*  PARAMS: site,					*/
/*          f  						*/
/*  REV 1.0.2 VMG					*/
/************************************/
exports.postSite = function postSite(site, f) {
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
            

            var querySelect = connection.query('SELECT COUNT(*) AS cuantos FROM emplazamientos ' +
                'WHERE nombre=? AND configuracion_id=? ', [site.name, site.cfg_idCFG],
                function(err, rows) {
                    logging.Trace(querySelect.sql);
                    if (err) {
                        connection.end();
                        return f({ error: err.message, data: null });
                    }
                    else if (rows.length > 0 && rows[0].cuantos != 0) {
                        connection.end();
                        return f({ error: 'ER_DUP_ENTRY', data: null });
                    }
                    else {
                        var queryInsert = connection.query('INSERT INTO emplazamientos (nombre, configuracion_id) ' +
                            'VALUES (?,?)', [site.name, site.cfg_idCFG],
                            function(err, result) {
                                logging.Trace(queryInsert.sql);
                                connection.end();
                                if (err)
                                    return f({ error: err, data: null });
                                else
                                    return f({ error: err, data: result.insertId });
                            });
                    }
                });
        }
    });
};

/************************************/
/*	FUNCTION: putSite 				*/
/*  PARAMS: idSite,					*/
/*			nameSite,				*/
/*          f  						*/
/*  REV 1.0.2 VMG					*/
/************************************/
exports.putSite = function putSite_old(idSite, idCfg, nameSite, f) {
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
            
            var querySelect = connection.query('SELECT COUNT(*) AS cuantos FROM emplazamientos ' +
                'WHERE nombre=? AND configuracion_id=? AND idemplazamiento!=? ', [nameSite, idCfg, idSite],
                function(err, rows) {
                    logging.Trace(querySelect.sql);
                    if (err) {
                        connection.end();
                        return f({ error: err.message, data: null });
                    }
                    else if (rows.length > 0 && rows[0].cuantos != 0) {
                        connection.end();
                        return f({ error: 'ER_DUP_ENTRY', dupName: nameSite });
                    }
                    else {
                        var query = connection.query('UPDATE emplazamientos SET nombre=? ' +
                            'WHERE idemplazamiento=?', [nameSite, idSite],
                            function(err, result) {
                                logging.Trace(query.sql);
                                if (err) {
                                    connection.end();
                                    return f({ error: err });
                                }
                                else {
                                    query = connection.query('UPDATE pasarelas p ' +
                                        'LEFT JOIN emplazamientos e ON p.emplazamiento_id=e.idemplazamiento ' +
                                        'SET p.pendiente_actualizar=1 ' +
                                        'WHERE e.idemplazamiento=?', [idSite],
                                        function(err, result) {
                                            logging.Trace(query.sql);
                                            connection.end();
                                            if (err) {
                                                return f({ error: err });
                                            }
                                            else
                                                return f({ error: null, data: nameSite });
                                        });
                                }
                            });
                    }
                });
        }
    });
};

/**
 * 20190212. Nueva version para excluir la marca de pendientes en las pasarelas de los emplazamientos de configuraciones no activas.
 * @param {any} idSite
 * @param {any} idCfg
 * @param {any} nameSite
 * @param {any} f
 */
exports.putSite = async function putSite(idSite, idCfg, nameSite, f) {
    var mySql = require('mySql');
    var connection = ug5kdb.GetDbConnection();

    var res = await ug5kdb.QuerySync('SELECT COUNT(*) AS cuantos FROM emplazamientos ' +
        'WHERE nombre=? AND configuracion_id=? AND idemplazamiento!=? ', [nameSite, idCfg, idSite]);
    if (!res.error) {
        res = await ug5kdb.QuerySync('UPDATE emplazamientos SET nombre=? WHERE idemplazamiento=?', [nameSite, idSite]);
        if (!res.error) {
            res = await ug5kdb.QuerySync('UPDATE pasarelas p ' +
                'LEFT JOIN emplazamientos e ON p.emplazamiento_id=e.idemplazamiento ' +
                'LEFT JOIN configuraciones c ON c.idconfiguracion=e.configuracion_id ' +
                'SET p.pendiente_actualizar=1 ' +
                'WHERE e.idemplazamiento=? and c.activa=1', [idSite]);
            if (!res.error) {
                connection.end();
                return f({ error: null, data: nameSite, aplicarcambios: res.data.affectedRows });
            }
        }
    }
    connection.end();
    return f({ error: res.error });
};

/********************************************************/
/*	FUNCTION: deleteSite 								*/
/*	DESCRIPTION: Delete sites	 (all items associated	*/
/*		on cascade will be deleted too)					*/
/*  PARAMS: site: siteId 								*/
/*			f: callback result			 				*/
/*  REV 1.0.2 VMG										*/
/********************************************************/
exports.deleteSite = function deleteSite(site, f) {
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
            

            var query = connection.query('DELETE FROM emplazamientos WHERE idemplazamiento=?', [site],
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

/************************************/
/*	FUNCTION: getGatewaysOfSite	 	*/
/*  PARAMS: req,					*/
/*			res,					*/
/*			f  						*/
/*  REV 1.0.2 VMG					*/
/************************************/
exports.getGatewaysOfSite = function getGatewaysOfSite(site, f) {
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
            

            var query = connection.query('SELECT  p.nombre as name, p.idpasarela as idCGW ' +
                'FROM pasarelas p ' +
                'WHERE emplazamiento_id=? ', site, function(err, rows, fields) {
                    logging.Trace(query.sql);
                    connection.end();
                    if (err)
                        f({ error: err });
                    else
                        f({ error: err, data: rows });
                });
        }
    });
};

exports.getSite = function getSite(idSite, f) {
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
            

            var query = connection.query('SELECT * FROM emplazamiento WHERE idEMPLAZAMIENTO=?', idSite, function(err, rows, fields) {
                logging.Trace(query.sql);
                connection.end();
                if (err)
                    f(null);
                else if (rows == null || rows.length == 0)
                    f(null);
                else
                    f(rows[0]);
            });
        }
    });
};

/************************************/
/*	FUNCTION: copySite				*/
/*  PARAMS: sourceIdSite,			*/
/*			targetNameSite,			*/
/* 			callback function 		*/
/************************************/
exports.copySite = function copySite(sourceIdSite, targetNameSite, idCfg, f) {
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

        var cfgId = idCfg;

        //Buscar si ya exite ese nombre de emplazamiento en la Configuracion
        query = connection.query('SELECT name FROM emplazamiento WHERE cfg_idCFG = ?', idCfg, function(err, result) {
            logging.Trace(query.sql);
            if (err) {
                connection.end();
                return f({ error: err.code });
            }
            else {
                for (var i = 0; i < result.length; i++) {
                    if (targetNameSite == result[i].name) {
                        connection.end();
                        return f({ error: "ER_DUP_ENTRY" });
                    }
                }
            }
            // Crear el emplazamiento
            query = connection.query('INSERT INTO emplazamiento (cfg_idCFG,name) VALUES (?,?)', [idCfg, targetNameSite], function(err, result) {
                logging.Trace(query.sql);
                if (err) {
                    connection.end();
                    return f({ error: err.code, data: trgt });
                }
                logging.Trace(query.sql);
                var _newSite = result.insertId;

                // Crear las pasarelas asociadas a los emplazamientos correspondientes a la configuración
                query = connection.query('INSERT INTO cgw (EMPLAZAMIENTO_idEMPLAZAMIENTO,REGIONES_idREGIONES,servicio,name,dualidad,ipv,ips,nivelconsola,puertoconsola,nivelIncidencias) ' +
                    '(SELECT ?,c.REGIONES_idREGIONES,c.servicio,c.name,c.dualidad,c.ipv,c.ips,c.nivelconsola,c.puertoconsola,c.nivelIncidencias FROM cgw c ' +
                    'WHERE EMPLAZAMIENTO_idEMPLAZAMIENTO=?)', [_newSite, sourceIdSite], function(err, result) {
                        logging.Trace(query.sql);
                        if (err) {
                            connection.end();
                            return f({ error: err.code, data: trgt });
                        }

                        // Guarda el id de la primera cgw dada de alta
                        // Se utiliza al dar de alta el hardware
                        var _idCgw = result.insertId;


                        // Crear las cpus pertenecientes a las pasarelas asociadas
                        // a los emplazamientos correspondientes a la configuración
                        query = connection.query('INSERT INTO cpu (CGW_idCGW,num,tlan,ip0,ms0,ip1,ms1,ipb,msb,ipg) ' +
                            '(SELECT c2.idCGW, c.num,c.tlan,c.ip0,c.ms0,c.ip1,c.ms1,c.ipb,c.msb,c.ipg ' +
                            'FROM cpu c ' +
                            'INNER JOIN cgw cgw ON cgw.idCGW = c.CGW_idCGW ' +
                            'INNER JOIN emplazamiento e ON e.idEMPLAZAMIENTO = ' +
                            'cgw.EMPLAZAMIENTO_idEMPLAZAMIENTO AND e.idEMPLAZAMIENTO = ? ' +
                            'LEFT JOIN cgw c2 ON cgw.name = c2.name ' +
                            'WHERE c2.EMPLAZAMIENTO_idEMPLAZAMIENTO = ?)',
                            [sourceIdSite, _newSite], function(err, result) {
                                logging.Trace(query.sql);
                                if (err) {
                                    connection.end();
                                    return f({ error: err.code, data: trgt });
                                }

                                //AQUI VAMOS A HACER EL UPDATE de LAS ips y de los nombres!!!
                                updateIpsAndNames(sourceIdSite, _idCgw, _newSite, function(data) {
                                    var data1 = data;
                                });

                                ////AQUI VAMOS A HACER EL UPDATE DE LOS SERVICIOS!!!
                                updateServices4Copy(sourceIdSite, _newSite, function(data) {
                                    var data1 = data;
                                });
                                // Obtener los ids de las pasarelas de la configuración original
                                query = connection.query('SELECT C.idCGW,c.name FROM cgw c ' +
                                    'WHERE c.EMPLAZAMIENTO_idEMPLAZAMIENTO=?', sourceIdSite, function(err, rows, fields) {
                                        if (err == null && rows != null && rows.length > 0) {
                                            var _numPasarelas = 0;

                                            async.eachSeries(rows,
                                                function(gtw, callback) {
                                                    async.waterfall([
                                                        function(callback) {
                                                            var posTargetIds = [];
                                                            var i = 0;
                                                            async.whilst(
                                                                function() {
                                                                    return i < 4;
                                                                },
                                                                function(callback) {
                                                                    var nameSlave = gtw.name + '_' + i++;
                                                                    ///	Copiar slaves
                                                                    var querySlaves = connection.query('INSERT INTO slaves (name,tp) VALUES (?,0)', nameSlave, function(err, resultSlaves) {
                                                                        logging.Trace(querySlaves.sql);
                                                                        posTargetIds.push(resultSlaves.insertId);

                                                                        /// Copiar hardware
                                                                        var queryHw = connection.query('INSERT INTO hardware (CGW_idCGW,SLAVES_idSLAVES,rank) VALUES (?,?,?)',
                                                                            [_idCgw + _numPasarelas, resultSlaves.insertId, i - 1], function(err, resultHw) {
                                                                                logging.Trace(queryHw.sql);

                                                                                callback();
                                                                            });
                                                                    });
                                                                },
                                                                function(err) {
                                                                    ///
                                                                    /// Ha finalizado de copiar slaves y hardware
                                                                    ///
                                                                    callback(null, posTargetIds);
                                                                }
                                                            );
                                                        }],
                                                        function(err, targets) {
                                                            _numPasarelas++;
                                                            myLibGateways.getHardwareByIdGateway(gtw.idCGW, function(result) {
                                                                var cuantos = 0;
                                                                if (result.hardware != null && result.hardware.length > 0) {
                                                                    async.each(result.hardware,
                                                                        function(p, callback) {
                                                                            myLibGateways.copyResources(p.idSLAVES, targets[cuantos++], function(error) {
                                                                                callback();
                                                                            });
                                                                        },
                                                                        function(err) {
                                                                            callback(null);
                                                                        }
                                                                    );
                                                                }
                                                            });

                                                        }
                                                    );
                                                },
                                                function(err) {
                                                    connection.end();

                                                    if (err != null)
                                                        f({ error: err.code, IdSite: _newSite });
                                                    else {
                                                        f({ error: null, IdSite: _newSite });
                                                    }
                                                }
                                            );
                                        }
                                    });
                            });
                    });
            });
        });
    });
};

exports.updateCfg = function(idSite, idCfg, f) {
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
            

            var existsQuery = connection.query('SELECT COUNT(*) as cuantos FROM ug5k.emplazamiento WHERE name=(SELECT name FROM ug5k.emplazamiento where idEmplazamiento=?) AND cfg_idCFG=?',
                [idSite, idCfg], function(err, rows) {
                    logging.Trace(existsQuery.sql);
                    if (err) {
                        connection.end();
                        f({ error: err, data: null });
                    }
                    else if (rows.length > 0 && rows[0].cuantos > 0) {
                        connection.end();
                        f({ error: 'ER_DUP_ENTRY', data: null });
                    }
                    else {
                        var query = connection.query('UPDATE emplazamiento SET cfg_idCFG=? WHERE idEMPLAZAMIENTO=?', [idCfg, idSite], function(err, result) {
                            logging.Trace(query.sql);
                            if (err) {
                                connection.end();
                                return f(false);
                            }

                            query = connection.query('UPDATE cgw_cfg SET cfg_idCFG=? WHERE cgw_idCGW IN ' +
                                '(SELECT idCGW FROM cgw WHERE EMPLAZAMIENTO_idEMPLAZAMIENTO=?)', [idCfg, idSite], function(err, result) {

                                    connection.end();
                                    logging.Trace(query.sql);
                                    if (err) {
                                        return f(false);
                                    }
                                    f(true);
                                });
                        });
                    }

                });
        }
    });
};

function updateServices4Copy(oldSite, newSite, f) {
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
            
            //// CODIGO ASÍNCRONO
            //async.waterfall([
            //    selectDataFromCgwAndService,
            //    createNewServices,
            //    selectDataForUpdate,
            //    updateData4Service
            //], function (err, result) {
            //    f({ data: result });
            //});

            var data2Update = [];
            var data2UpdateAux = [];

            var selectDataFromCgwAndService = function /*selectDataFromCgwAndService*/(callback) {
                var query = connection.query(
                    'SELECT c3.name as NombreConfiguracion, c.name as NombrePasarela, ' +
                    'c.idCGW as idPasarela, c.servicio as idServicio, ' +
                    's.SIP_idSIP, s.WEB_idWEB, s.SNMP_idSNMP, s.GRAB_idGRAB, s.SINCR_idSINCR ' +
                    'FROM cgw c ' +
                    'LEFT JOIN cgw_cfg c2 ON c.idCGW = c2.CGW_idCGW ' +
                    'LEFT JOIN cfg c3 ON c2.CFG_idCFG = c3.idCFG ' +
                    'LEFT JOIN servicios s ON c.servicio = s.idSERVICIOS ' +
                    'WHERE c.EMPLAZAMIENTO_idEMPLAZAMIENTO = ? ', oldSite,
                    function(err, rows, fields) {
                        logging.Trace(query.sql);
                        if (err || rows.length == 0) {
                            return callback(rows.length == 0 ? 'ERROR' : err);
                        }
                        else {
                            for (var i = 0; i < rows.length; i++) {
                                var object2Update = {};
                                object2Update.old_idServicio = rows[i].idServicio;
                                data2Update.push(object2Update);
                            }
                            return callback(null, rows, data2Update);
                        }
                    });
            };
            var createNewServices = function /*createNewServices*/(updateServiciosArray, data2Update, callback) {
                var queries = '';
                updateServiciosArray.forEach(function(item) {
                    queries += mySql.format('INSERT INTO servicios (name,SIP_idSIP,WEB_idWEB,' +
                        'SNMP_idSNMP,GRAB_idGRAB,SINCR_idSINCR) VALUES (?,?,?,?,?,?); ',
                        [item.NombreConfiguracion + '-' + item.NombrePasarela + '(Copia)',
                        item.SIP_idSIP, item.WEB_idWEB, item.SNMP_idSNMP, item.GRAB_idGRAB, item.SINCR_idSINCR]);
                });
                connection.query(queries, function(err, results) {
                    if (err) {
                        connection.end();
                    }
                    else {
                        var iteraciones = 0;
                        var object2Update = null;
                        if (results.affectedRows == 1) {
                            object2Update = {};
                            object2Update.new_idServicio = results.insertId;
                            object2Update.old_idServicio = data2Update[0].old_idServicio;
                            data2UpdateAux.push(object2Update);
                        }
                        else {
                            for (var i = 0; i < results.length; i++) {
                                object2Update = {};
                                object2Update.new_idServicio = results[i].insertId;
                                object2Update.old_idServicio = data2Update[i].old_idServicio;
                                data2UpdateAux.push(object2Update);
                            }
                        }

                        return callback(null, data2UpdateAux);
                    }
                });
            };
            var selectDataForUpdate = function /*selectDataForUpdate*/(data2UpdateAux, callback) {
                var query = connection.query('SELECT c.idCGW, c.servicio ' +
                    'FROM cgw c ' +
                    'LEFT JOIN cgw_cfg c2 ON c.idCGW = c2.CGW_idCGW ' +
                    'LEFT JOIN cfg c3 ON c2.CFG_idCFG = c3.idCFG ' +
                    'WHERE c.EMPLAZAMIENTO_idEMPLAZAMIENTO = ?', newSite,
                    function(err, rows, fields) {
                        logging.Trace(query.sql);
                        if (err || rows.length == 0) {
                            return callback(rows.length == 0 ? 'ERROR' : err);
                        }
                        else {
                            data2Update = [];
                            for (var i = 0; i < rows.length; i++) {
                                var object2Update = {};
                                object2Update.idCGW = rows[i].idCGW;
                                object2Update.old_idServicio = rows[i].servicio;
                                object2Update.new_idServicio = data2UpdateAux[i].new_idServicio;
                                data2Update.push(object2Update);
                            }
                            return callback(null, data2Update);
                        }
                    });
            };
            var updateData4Service = function /*updateData4Service*/(data4Update, callback) {
                var queries = '';
                data4Update.forEach(function(item) {
                    queries += mySql.format('UPDATE cgw SET servicio=? WHERE idCGW=? ;',
                        [item.new_idServicio, item.idCGW]);
                });
                connection.query(queries, function(err, results) {
                    if (err) {
                        connection.end();
                    }
                    else {
                        return callback(null, "OK");
                    }
                });
            };
            // CODIGO ASÍNCRONO
            async.waterfall([
                selectDataFromCgwAndService,
                createNewServices,
                selectDataForUpdate,
                updateData4Service
            ], function(err, result) {
                f({ data: result });
            });
        }
    });
}

function updateIpsAndNames(sourceIdSite, newIdCgw, newSite, f) {
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
            

            var configListData = [];
            var data2Insert = [];

            //// CODIGO ASÍNCRONO
            //async.waterfall([
            //    selectNewidCGW,
            //    selectDataFromConfig,
            //    updateDataFromCgw
            //], function (err, result) {
            //    f({ data: result });
            //});
            var selectNewidCGW = function /*selectNewidCGW*/(callback) {
                var query = connection.query('SELECT idCGW, name FROM cgw ' +
                    'WHERE EMPLAZAMIENTO_idEMPLAZAMIENTO = ?', [newSite],
                    function(err, rows, fields) {
                        logging.Trace(query.sql);
                        if (err || rows.length == 0) {
                            return callback(rows.length == 0 ? 'ERROR' : err);
                        }
                        else {
                            return callback(null, rows);
                        }
                    });
            };
            var selectDataFromConfig = function /*selectDataFromConfig*/(newCgwIdsAndNames, callback) {
                var query = connection.query('SELECT cgw.idCGW, cgw.name, c.ipb, e.idEMPLAZAMIENTO ' +
                    'FROM cpu c ' +
                    'INNER JOIN cgw cgw ON cgw.idCGW = c.CGW_idCGW ' +
                    'INNER JOIN emplazamiento e ON e.idEMPLAZAMIENTO =  cgw.EMPLAZAMIENTO_idEMPLAZAMIENTO AND e.idEMPLAZAMIENTO IN ' +
                    '(SELECT idEMPLAZAMIENTO ' +
                    'FROM emplazamiento ' +
                    'WHERE cfg_idCFG = (SELECT cfg_idCFG ' +
                    'FROM emplazamiento ' +
                    'WHERE idEMPLAZAMIENTO = ?) ' +
                    'AND idEMPLAZAMIENTO NOT LIKE ?)', [sourceIdSite, newSite],
                    function(err, rows, fields) {
                        logging.Trace(query.sql);
                        if (err || rows.length == 0) {
                            return callback(rows.length == 0 ? 'ERROR' : err);
                        }
                        else {
                            var incrementFlag = false;
                            var j = 0;
                            var newIpListInConfig = generateIps(rows, sourceIdSite);
                            for (var i = 0; i < newIpListInConfig.length; i++) {
                                var object2Insert = {};
                                if (incrementFlag) {
                                    object2Insert.idCGW = newCgwIdsAndNames[j].idCGW;
                                    object2Insert.oldName = newCgwIdsAndNames[j].name;
                                    j++;
                                    incrementFlag = false;
                                }
                                else {
                                    object2Insert.idCGW = newCgwIdsAndNames[j].idCGW;
                                    object2Insert.oldName = newCgwIdsAndNames[j].name;
                                    incrementFlag = true;
                                }
                                object2Insert.idEMPLAZAMIENTO = newSite;
                                object2Insert.oldIpb = newIpListInConfig[i].oldIpb;
                                object2Insert.newIpb = newIpListInConfig[i].newIpb;
                                object2Insert.name = object2Insert.oldName + '(Copia)';
                                data2Insert.push(object2Insert);
                            }
                            return callback(null, data2Insert, newIdCgw);
                        }
                    });
            };
            var updateDataFromCgw = function /*updateDataFromCgw*/(data2Insert, newIdCgw, callback) {
                multipleIpsUpdate(data2Insert, newIdCgw);
                for (var i = 0; i < data2Insert.length; i++) {
                    multipleNameUpdate(data2Insert[i]);
                }
                //if(err)
                //	return callback(rows.length == 0 ? 'NO_DATA' : err);
                //else
                return callback(null, "UPDATE_OK");
            };
            // CODIGO ASÍNCRONO
            async.waterfall([
                selectNewidCGW,
                selectDataFromConfig,
                updateDataFromCgw
            ], function(err, result) {
                f({ data: result });
            });
        }
    });
}

function multipleNameUpdate(data2Insert) {
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
            

            var query = connection.query('UPDATE cgw SET name=? WHERE idCGW=?', [data2Insert.name, data2Insert.idCGW],
                function(err, rows, fields) {
                    logging.Trace(query.sql);
                    if (err) {
                        connection.end();
                    }
                    else {
                        connection.end();
                    }
                });
        }
    });
}

function multipleIpsUpdate(data2Insert, newIdCgw) {
    var mySql = require('mySql');
    var connection = ug5kdb.GetDbConnection();/* mySql.createConnection({
        host: gcfg.Ulises.dbhost,
        user: gcfg.Ulises.dbuser,
        password: gcfg.Ulises.dbpassword,
        database: gcfg.Ulises.dbdatabase,
        multipleStatements: true
    });*/

    var updateArray = [];
    data2Insert.forEach(function(item) {
        var updateObject = {};
        updateObject.newIpb = item.newIpb;
        updateObject.oldIpb = item.oldIpb;
        updateObject.idCGW = item.idCGW;
        updateArray.push(updateObject);
    });
    connection.connect(function(err, usrs) {
        if (err) {
            logging.Error("Error connection to 'U5K-G' database.");
        }
        else {
            

            var queries = '';
            updateArray.forEach(function(item) {
                queries += mySql.format('UPDATE cpu SET ipb=? WHERE CGW_idCGW=? AND ipb=?; ', [item.newIpb, item.idCGW, item.oldIpb]);
            });
            connection.query(queries, function(err, results) {
                if (err) {
                    connection.end();
                }
                else {
                    connection.end();
                }
            });
        }
    });
}

function generateIps(ipList, sourceIdSite) {
    var newList = [];
    var generatedList = [];
    var newIp = "";
    var incIpDigit = 0;
    var ipGeneratesCounter = 0;

    var oldIps = [];
    for (var index in ipList) {
        if (ipList[index].idEMPLAZAMIENTO == sourceIdSite) {
            //Cuantas Ips hay que generar (solo del empla)
            oldIps[ipGeneratesCounter] = ipList[index].ipb;
            ipGeneratesCounter++;
        }

        newList.push(ipList[index].ipb);//Metemos todas las ips porque tienen que ser unicas en config
    }

    var validIp = false;
    var ipFound = false;
    var i = 0;
    var k = 1;

    while (generatedList.length != ipGeneratesCounter) {
        do {
            //Separar y elegir el dígito para generar ips
            var ip = newList[i].split(".");

            if (parseInt(ip[3]) < 255) {
                incIpDigit = parseInt(ip[3]) + k;
                newIp = ip[0] + '.' + ip[1] + '.' + ip[2] + '.' + incIpDigit.toString();
            }
            else if (parseInt(ip[2]) < 255) {
                incIpDigit = parseInt(ip[2]) + k;
                newIp = ip[0] + '.' + ip[1] + '.' + incIpDigit.toString() + '.' + ip[3];
            }
            //Comprobar si la ip existe tanto en la lista original como en la que estamos creando
            for (var i1 = 0; i1 < generatedList.length; i1++) {
                if (newIp == generatedList[i1].newIpb) {
                    ipFound = true;
                    break;
                }
            }
            if (!ipFound) {
                for (var j = 0; j < newList.length; j++) {
                    if (newIp == newList[j]) {
                        ipFound = true;
                        break;
                    }
                }
            }
            if (ipFound) {
                if (k == 255)
                    i++;
                else
                    k++;
                ipFound = false;
            }
            else
                validIp = true;

        } while (!validIp);
        var object2Insert = {};
        object2Insert.newIpb = newIp;
        object2Insert.oldIpb = oldIps[i];
        generatedList.push(object2Insert);
        validIp = false;
    }
    return generatedList;
}