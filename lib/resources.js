var async = require('async');
var logging = require('./nu-log.js');

/** AGL */
var gcfg = require('../configUlises.json');
var ug5kdb = require('./ug5kdb.js');


/********************************************************/
/*	FUNCTION: delRadioResource 							*/
/*	DESCRIPTION: Delete radio resource (all items 		*/
/*		associate on cascade will be deleted too)		*/
/*  PARAMS: idResource: resourceId 						*/
/*			res: result			 						*/
/*  REV 1.0.2 VMG										*/
/********************************************************/
exports.delRadioResource = function delRadioResource(resourceId, f) {
    var mySql = require('mySql');
    var connection = ug5kdb.GetDbConnection();/* mySql.createConnection({
		host: gcfg.Ulises.dbhost,
		user: gcfg.Ulises.dbuser,
		password: gcfg.Ulises.dbpassword,
		database: gcfg.Ulises.dbdatabase
	});*/
    var activa = 0;
    var id_pasarela = 0;
    connection.connect(function(err) {
        if (err) {
            logging.Trace("Error connention to 'U5K-G' database.");
            return;
        }
        else {
            
            var selQuery = connection.query('SELECT c.activa,p.idpasarela ' +
                'FROM recursos_radio rr ' +
                'LEFT JOIN pasarelas p ON rr.pasarela_id=p.idpasarela ' +
                'LEFT JOIN emplazamientos e ON p.emplazamiento_id=e.idemplazamiento ' +
                'LEFT JOIN configuraciones c ON e.configuracion_id=c.idconfiguracion ' +
                'WHERE rr.idrecurso_radio=?', [resourceId],
                function(err, rows) {
                    if (err) {
                        connection.end();
                        return f({ error: err.message });
                    }
                    else {
                        activa = rows[0].activa;
                        id_pasarela = rows[0].idpasarela;
                        var delQuery = connection.query('DELETE FROM recursos_radio WHERE idrecurso_radio=?', [resourceId],
                            function(err, rows) {
                                connection.end();
                                logging.Trace(delQuery.sql);
                                if (err) {
                                    return f({ error: err.message });
                                }
                                else {
                                    updatePasarela(id_pasarela);
                                    return f({ data: 'OK', activa: activa });
                                }
                            });
                    }
                });
        }
    });
};

/********************************************************/
/*	FUNCTION: delRadioResource 							*/
/*	DESCRIPTION: Delete radio resource (all items 		*/
/*		associate on cascade will be deleted too)		*/
/*  PARAMS: idResource: resourceId 						*/
/*			res: result			 						*/
/*  REV 1.0.2 VMG										*/
/********************************************************/
exports.delPhoneResource = function delPhoneResource(resourceId, f) {
    var mySql = require('mySql');
    var connection = ug5kdb.GetDbConnection();/* mySql.createConnection({
		host: gcfg.Ulises.dbhost,
		user: gcfg.Ulises.dbuser,
		password: gcfg.Ulises.dbpassword,
		database: gcfg.Ulises.dbdatabase
	});*/
    var activa = 0;
    var id_pasarela = 0;
    connection.connect(function(err) {
        if (err) {
            logging.Trace("Error connention to 'U5K-G' database.");
            return;
        }
        else {
            
            var selQuery = connection.query('SELECT c.activa,p.idpasarela ' +
                'FROM recursos_telefono rt ' +
                'LEFT JOIN pasarelas p ON rt.pasarela_id=p.idpasarela ' +
                'LEFT JOIN emplazamientos e ON p.emplazamiento_id=e.idemplazamiento ' +
                'LEFT JOIN configuraciones c ON e.configuracion_id=c.idconfiguracion ' +
                'WHERE rt.idrecurso_telefono=?', [resourceId],
                function(err, rows) {
                    if (err) {
                        connection.end();
                        return f({ error: err.message });
                    }
                    else {
                        activa = rows[0].activa;
                        id_pasarela = rows[0].idpasarela;
                        var delQuery = connection.query('DELETE FROM recursos_telefono WHERE idrecurso_telefono=?', [resourceId],
                            function(err, rows) {
                                connection.end();
                                logging.Trace(delQuery.sql);
                                if (err) {
                                    return f({ error: err.message });
                                }
                                else {
                                    updatePasarela(id_pasarela);
                                    return f({ data: 'OK', activa: activa });
                                }
                            });
                    }
                });
        }
    });
};

/********************************************************/
/*	FUNCTION: delRadioResource 							*/
/*	DESCRIPTION: Update cgw when a resource is deleted 	*/
/*		activating update_pending flag					*/
/*  PARAMS: idResource: id_pasarela 					*/
/*								 						*/
/*  REV 1.0.2 VMG										*/
/********************************************************/
function updatePasarela(id_pasarela) {
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
            return;
        }
        else {
            
            var updateQuery = connection.query('UPDATE pasarelas p ' +
                'SET p.pendiente_actualizar=1 ' +
                'WHERE p.idpasarela=?', [id_pasarela],
                function(err, result) {
                    logging.Trace(query.sql);
                    connection.end();
                });
        }
    });
}

/****************************/
/*	FUNCTION: getResources 	*/
/*  PARAMS: 				*/
/****************************/
exports.getResources = function getResources(f) {
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
            

            var query = connection.query('SELECT * FROM RECURSO', function(err, rows, fields) {

                if (err || rows.length == 0) {
                    connection.end();
                    return f(err ? err : 'NO_DATA');
                }

                connection.end();
                logging.Trace(query.sql);
                f({ error: err, recursos: rows });
            });
        }
    });
};

exports.getFreeResources = function getFreeResources(f) {
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
            

            var query = connection.query('SELECT r.* FROM recurso r ' +
                'LEFT JOIN colateral c ON c.RECURSO_idRECURSO=r.idRECURSO ' +
                'WHERE c.RECURSO_idRECURSO IS NULL', function(err, rows, fields) {

                    if (err || rows.length == 0) {
                        connection.end();
                        return f(err ? err : 'NO_DATA');
                    }

                    connection.end();
                    logging.Trace(query.sql);
                    f({ error: err, recursos: rows });
                });
        }
    });
};

exports.getResource = function getResource(rsc, f) {
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
            


            var query = connection.query('SELECT * FROM (' +
                'SELECT r.*,true as blanca, u.*, d.name as frecuencia, d.idDESTINOS as idDESTINOS FROM RECURSO R ' +
                'LEFT JOIN listablanca lb on lb.RECURSO_idRECURSO=r.idRECURSO ' +
                'LEFT JOIN urilistas u ON u.idURILISTAS = lb.URILISTAS_idURILISTAS ' +
                'LEFT JOIN colateral c ON c.RECURSO_idRECURSO = r.idRECURSO ' +
                'LEFT JOIN destinos d ON d.idDESTINOS = c.DESTINOS_idDESTINOS ' +
                'WHERE idRECURSO=? ' +
                'UNION ' +
                'SELECT r.*,false as blanca, u.*,d.name as frecuencia, d.idDESTINOS as idDESTINOS FROM RECURSO R ' +
                'LEFT JOIN listanegra ln on ln.RECURSO_idRECURSO=r.idRECURSO ' +
                'LEFT JOIN urilistas u ON u.idURILISTAS = ln.URILISTAS_idURILISTAS ' +
                'LEFT JOIN colateral c ON c.RECURSO_idRECURSO = r.idRECURSO ' +
                'LEFT JOIN destinos d ON d.idDESTINOS = c.DESTINOS_idDESTINOS ' +
                'WHERE idRECURSO=?) a ORDER BY a.ip', [rsc, rsc], function(err, rows, fields) {

                    if (err || rows.length == 0) {
                        connection.end();
                        return f(err ? err : 'NO_DATA');
                    }

                    connection.end();
                    logging.Trace(query.sql);
                    f({ recursos: rows });
                });
        }
    });
};

exports.postResource = function postResource(resource, f) {
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
            

            var query = connection.query('INSERT INTO RECURSO SET ?', resource, function(err, result) {

                if (err) {
                    connection.end();
                    logging.Error("SQL: " + query.sql + "\nERROR: " + err.message);
                    return f({ error: err, data: null });
                }

                connection.end();
                logging.Trace(query.sql);
                f({ error: null, data: resource });
            });
        }
    });
};

exports.putResource = function putResource(resource, f) {
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
            

            var query = connection.query('UPDATE RECURSO SET ? WHERE idRECURSO=?', [resource.rsc, resource.rsc.idRECURSO], function(err, result) {

                if (err) {
                    connection.end();
                    logging.Error("SQL: " + query.sql + "\nERROR: " + err.message);
                    return f({ error: err, data: null });
                }

                connection.end();
                logging.Trace(query.sql);
                f({ error: null, data: resource });
            });
        }
    });
};

exports.delResource = function delResource(idPos, f) {
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
            

            // Eliminar un recurso supone eliminar la posicion en la slave...
            // Con la foreign key ON_DELETE: CASCADE, se elimina el recurso.
            // Y solo se eliminan si no forman  parte de la configuración activa
			/*
			var query = connection.query('DELETE FROM pos WHERE idPOS=? AND ' +
											'(? NOT IN (SELECT POS_idPOS from (SELECT POS_idPOS FROM recurso r ' +
											'INNER JOIN pos p ON p.idPOS=r.POS_idPOS ' +
											'INNER JOIN hardware h ON h.SLAVES_idSLAVES=p.SLAVES_idSLAVES ' +
											'INNER JOIN cgw_cfg c ON (c.CGW_idCGW=h.CGW_idCGW AND c.activa) ' +
										  	') as derived))', [idPos,idPos], function(err, result) {
			*/
            // Se permite eliminar recursos que forman  parte de la configuración activa (Incidencia #1200)
            var query = connection.query('DELETE FROM pos WHERE idPOS=?', idPos, function(err, result) {
                if (err) {
                    connection.end();
                    logging.Error("SQL: " + query.sql + "\nERROR: " + err.message);
                    return f({ error: err, data: null });
                }

                connection.end();
                f({ error: null, data: result.affectedRows });
            });
        }
    });
};


/*************************************************/
/***** getRadioParameters	**********************/
/*************************************************/
exports.getRadioParameters = function getRadioParameters(rsc, f) {
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
                Buffer_jitter: function(callback) {
                    var query = connection.query('SELECT * FROM jitter ' +
                        'WHERE RECURSO_idRECURSO=?', rsc, function(err, rows, fields) {
                            logging.Trace(query.sql);
                            if (err) {
                                logging.Error("SQL: " + query.sql + "\nERROR: " + err.message);
                                return callback(err);
                            }

                            if (rows != null && rows.length > 0) {
                                delete rows[0].idJITTER;
                                delete rows[0].RECURSO_idRECURSO;
                                callback(null, rows[0]);
                            }
                            else
                                callback(null, {});
                        });
                },
                hardware: function(callback) {
                    var query = connection.query('SELECT * FROM paramhw ' +
                        'WHERE RECURSO_idRECURSO=?', rsc, function(err, rows, fields) {
                            logging.Trace(query.sql);
                            if (err) {
                                logging.Error("SQL: " + query.sql + "\nERROR: " + err.message);
                                return callback(err);
                            }

                            if (rows != null && rows.length > 0) {
                                delete rows[0].idPARAMHW;
                                delete rows[0].RECURSO_idRECURSO;
                                callback(null, rows[0]);
                            }
                            else
                                callback(null, {});
                        });
                },
                radio: function(callback) {
                    var query = connection.query('SELECT * FROM paramradio ' +
                        'WHERE RECURSO_idRECURSO=?', rsc, function(err, rows, fields) {
                            logging.Trace(query.sql);
                            if (err) {
                                logging.Error("SQL: " + query.sql + "\nERROR: " + err.message);
                                return callback(err);
                            }

                            if (rows != null && rows.length > 0) {
                                delete rows[0].idPARAMRADIO;
                                delete rows[0].RECURSO_idRECURSO;
                                callback(null, rows[0]);
                            }
                            else
                                callback(null, {});
                        });
                },
                tablaAudio: function(callback) {
                    var query = connection.query('SELECT tb.idtabla_bss,tb.name FROM tabla_bss tb ' +
                        'INNER JOIN tabla_bss_recurso tbr ON tbr.tabla_bss_idtabla_bss = tb.idtabla_bss ' +
                        'WHERE tbr.recurso_idrecurso=?', rsc, function(err, rows, fields) {
                            logging.Trace(query.sql);
                            if (err) {
                                logging.Error("SQL: " + query.sql + "\nERROR: " + err.message);
                                return callback(err);
                            }

                            if (rows != null && rows.length > 0) {
                                callback(null, rows[0]);
                            }
                            else
                                callback(null, { idtabla_bss: '', name: '' });
                        });
                },
                valoresTablaAudio: function(callback) {
                    var query = connection.query('SELECT vt.valor_rssi FROM valores_tabla vt ' +
                        'INNER JOIN tabla_bss_recurso tbr ON tbr.tabla_bss_idtabla_bss = vt.tabla_bss_idtabla_bss ' +
                        'WHERE tbr.recurso_idrecurso=? ORDER BY vt.valor_prop', rsc, function(err, rows, fields) {
                            logging.Trace(query.sql);
                            if (err) {
                                logging.Error("SQL: " + query.sql + "\nERROR: " + err.message);
                                return callback(err);
                            }

                            if (rows != null && rows.length > 0) {
                                callback(null, rows);
                            }
                            else
                                callback(null, []);
                        });
                }
            }, function(err, results) {
                connection.end();

                f({ error: err, parametros: results });
            });
        }
    });
};

/*************************************************/
/****** postRadioParameters 	******************/
/*************************************************/
exports.postRadioParameters = function postRadioParameters(resource, params, f) {
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
            

            async.series({
                delete: function(callback) {
                    async.parallel({
                        delRadio: function(callback) {
                            var query = connection.query('DELETE FROM paramradio WHERE RECURSO_idRECURSO=?', resource, function(err, result) {
                                if (err) {
                                    logging.Error("SQL: " + query.sql + "\nERROR: " + err.message);
                                    return callback(err);
                                }

                                logging.Trace(query.sql);
                                callback();
                            });
                        },
                        delHw: function(callback) {
                            var query = connection.query('DELETE FROM paramhw WHERE RECURSO_idRECURSO=?', resource, function(err, result) {
                                if (err) {
                                    logging.Error("SQL: " + query.sql + "\nERROR: " + err.message);
                                    return callback(err);
                                }

                                logging.Trace(query.sql);
                                callback();
                            });
                        },
                        delJitter: function(callback) {
                            var query = connection.query('DELETE FROM jitter WHERE RECURSO_idRECURSO=?', resource, function(err, result) {
                                if (err) {
                                    logging.Error("SQL: " + query.sql + "\nERROR: " + err.message);
                                    return callback(err);
                                }

                                logging.Trace(query.sql);
                                callback();
                            });
                        },
                        delTablaAudio: function(callback) {
                            if (params.tAudio != null) {
                                var query = connection.query('DELETE FROM tabla_bss_recurso WHERE RECURSO_idRECURSO=?', resource, function(err, result) {
                                    if (err) {
                                        logging.Error("SQL: " + query.sql + "\nERROR: " + err.message);
                                        return callback(err);
                                    }

                                    logging.Trace(query.sql);
                                    callback();
                                });
                            }
                            else
                                callback();
                        }
                    }, callback);
                },
                insert: function(callback) {
                    async.parallel({
                        insRadio: function(callback) {
                            delete params.rd.tabla_indices_calidad;
                            // var tipo = typeof params.rd.iPrecisionAudio;
                            // if (tipo == "string")
                            // 	params.rd.iPrecisionAudio = parseInt(params.rd.iPrecisionAudio);

                            //Se eliminan los siguientes campos pues se mandan por compatibilidad
                            //de version de la pasarela Ulises
                            delete params.rd.FrqTonoSQ;
                            delete params.rd.UmbralTonoSQ;
                            delete params.rd.FrqTonoPTT;
                            delete params.rd.UmbralTonoPTT;
                            delete params.rd.SupervPortadoraTx;
                            delete params.rd.SupervModuladoraTx;


                            var query = connection.query('INSERT INTO paramradio SET ?', params.rd, function(err, result) {
                                if (err) {
                                    logging.Error("SQL: " + query.sql + "\nERROR: " + err.message);
                                    return callback(err);
                                }

                                logging.Trace(query.sql);
                                callback();
                            });
                        },
                        insHw: function(callback) {
                            var query = connection.query('INSERT INTO paramhw SET ?', params.hw, function(err, result) {
                                if (err) {
                                    logging.Error("SQL: " + query.sql + "\nERROR: " + err.message);
                                    return callback(err);
                                }

                                logging.Trace(query.sql);
                                callback();
                            });
                        },
                        insJitter: function(callback) {
                            var query = connection.query('INSERT INTO jitter SET ?', params.jt, function(err, result) {
                                if (err) {
                                    logging.Error("SQL: " + query.sql + "\nERROR: " + err.message);
                                    return callback(err);
                                }

                                logging.Trace(query.sql);
                                callback();
                            });
                        },
                        insTablaAudio: function(callback) {
                            if (params.tAudio != null && params.tAudio != "-1") {
                                var query = connection.query('INSERT INTO tabla_bss_recurso SET ?', { recurso_idrecurso: resource, tabla_bss_idtabla_bss: params.tAudio }, function(err, result) {
                                    if (err) {
                                        logging.Error("SQL: " + query.sql + "\nERROR: " + err.message);
                                        return callback(err);
                                    }

                                    logging.Trace(query.sql);
                                    callback();
                                });
                            }
                            else
                                callback();
                        }
                    }, callback);
                }
            },
                function(err) {
                    connection.end();

                    if (err)
                        f({ error: err, data: params });
                    else
                        f({ error: null, data: params });
                }
            );
        }
    });
};

/*************************************************/
/*********	PARAMETROS TELEFONÍA	**************/
/********* getTelephoneParameters	**************/
/*************************************************/
exports.getTelephoneParameters = function getTelephoneParameters(rsc, f) {
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
                Buffer_jitter: function(callback) {
                    var query = connection.query('SELECT * FROM jitter ' +
                        'WHERE RECURSO_idRECURSO=?', rsc, function(err, rows, fields) {
                            logging.Trace(query.sql);
                            if (err) {
                                logging.Error("SQL: " + query.sql + "\nERROR: " + err.message);
                                return callback(err);
                            }

                            if (rows != null && rows.length > 0) {
                                delete rows[0].idJITTER;
                                delete rows[0].RECURSO_idRECURSO;
                                callback(null, rows[0]);
                            }
                            else
                                callback(null, {});
                        });
                },
                hardware: function(callback) {
                    var query = connection.query('SELECT * FROM paramhw ' +
                        'WHERE RECURSO_idRECURSO=?', rsc, function(err, rows, fields) {
                            logging.Trace(query.sql);
                            if (err) {
                                logging.Error("SQL: " + query.sql + "\nERROR: " + err.message);
                                return callback(err);
                            }

                            if (rows != null && rows.length > 0) {
                                delete rows[0].idPARAMHW;
                                delete rows[0].RECURSO_idRECURSO;
                                callback(null, rows[0]);
                            }
                            else
                                callback(null, {});
                        });
                },
                telefonia: function(callback) {
                    var query = connection.query('SELECT * FROM paramtelef ' +
                        'WHERE RECURSO_idRECURSO=?', rsc, function(err, rows, fields) {
                            logging.Trace(query.sql);
                            if (err) {
                                logging.Error("SQL: " + query.sql + "\nERROR: " + err.message);
                                return callback(err);
                            }

                            if (rows != null && rows.length > 0) {
                                delete rows[0].idPARAMTELEF;
                                delete rows[0].RECURSO_idRECURSO;
                                callback(null, rows[0]);
                            }
                            else
                                callback(null, {});
                        });
                },
                ats_rangos_dst: function(callback) {
                    var query = connection.query('SELECT inicial,final FROM rangos r ' +
                        'LEFT JOIN paramtelef pt ON pt.idPARAMTELEF=r.PARAMTELEF_idPARAMTELEF ' +
                        'WHERE !r.origen AND pt.RECURSO_idRECURSO=?', rsc, function(err, rows, fields) {
                            logging.Trace(query.sql);
                            if (err) {
                                logging.Error("SQL: " + query.sql + "\nERROR: " + err.message);
                                return callback(err);
                            }

                            if (rows != null && rows.length > 0)
                                callback(null, rows);
                            else
                                callback(null, []);
                        });
                },
                ats_rangos_org: function(callback) {
                    var query = connection.query('SELECT inicial,final FROM rangos r ' +
                        'LEFT JOIN paramtelef pt ON pt.idPARAMTELEF=r.PARAMTELEF_idPARAMTELEF ' +
                        'WHERE r.origen AND pt.RECURSO_idRECURSO=?', rsc, function(err, rows, fields) {
                            logging.Trace(query.sql);
                            if (err) {
                                logging.Error("SQL: " + query.sql + "\nERROR: " + err.message);
                                return callback(err);
                            }

                            if (rows != null && rows.length > 0)
                                callback(null, rows);
                            else
                                callback(null, []);
                        });
                }
            }, function(err, results) {
                connection.end();

                f({ error: err, parametros: results });
            });
        }
    });
};

/*************************************************/
/****** postTelephoneParameters	******************/
/*************************************************/
exports.postTelephoneParameters = function postTelephoneParameters(resource, params, f) {
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
            

            var query = connection.query('SELECT * FROM paramtelef WHERE RECURSO_idRECURSO=?', resource, function(err, rows, fields) {
                if (err) {
                    logging.Error("SQL: " + query.sql + "\nERROR: " + err.message);
                    return callback(err);
                }

                logging.Trace(query.sql);
                if (err) {
                    logging.Error("SQL: " + query.sql + "\nERROR: " + err.message);
                    return callback(err);
                }

                if (rows != null && rows.length > 0) {

                    params.tf.idPARAMTELEF = rows[0].idPARAMTELEF;

                    // PUT
                    async.parallel({
                        insRadio: function(callback) {
                            //Se eliminan los siguientes campos pues son de la version ulises, no se usan en REDAN
                            delete params.tf.idRed;
                            delete params.tf.idTroncal;
                            delete params.tf.listaEnlacesInternos;
                            delete params.tf.ats_rangos_operador;
                            delete params.tf.ats_rangos_privilegiados;
                            delete params.tf.ats_rangos_directos_ope;
                            delete params.tf.ats_rangos_directos_pri;

                            var tipo = typeof params.tf.iT_Int_Warning;
                            if (tipo == "string")
                                params.tf.iT_Int_Warning = parseInt(params.tf.iT_Int_Warning);

                            var query = connection.query('UPDATE paramtelef SET ? WHERE RECURSO_idRECURSO=?', [params.tf, resource], function(err, result) {
                                if (err) {
                                    logging.Error("SQL: " + query.sql + "\nERROR: " + err.message);
                                    return callback(err);
                                }

                                logging.Trace(query.sql);
                                callback();
                            });
                        },
                        insHw: function(callback) {
                            var query = connection.query('UPDATE paramhw SET ? WHERE RECURSO_idRECURSO=?', [params.hw, resource], function(err, result) {
                                if (err) {
                                    logging.Error("SQL: " + query.sql + "\nERROR: " + err.message);
                                    return callback(err);
                                }

                                logging.Trace(query.sql);
                                callback();
                            });
                        },
                        insJitter: function(callback) {
                            var query = connection.query('UPDATE jitter SET ? WHERE RECURSO_idRECURSO=?', [params.jt, resource], function(err, result) {
                                if (err) {
                                    logging.Error("SQL: " + query.sql + "\nERROR: " + err.message);
                                    return callback(err);
                                }

                                logging.Trace(query.sql);
                                callback();
                            });
                        }
                    }, function(err) {
                        connection.end();

                        if (err)
                            f({ error: err, data: params });
                        else
                            f({ error: null, data: params });
                    });
                } else {
                    // POST
                    async.parallel({
                        insRadio: function(callback) {
                            var query = connection.query('INSERT INTO paramtelef SET ?', params.tf, function(err, result) {
                                if (err) {
                                    logging.Error("SQL: " + query.sql + "\nERROR: " + err.message);
                                    return callback(err);
                                }

                                params.tf.idPARAMTELEF = result.insertId;

                                logging.Trace(query.sql);
                                callback();
                            });
                        },
                        insHw: function(callback) {
                            var query = connection.query('INSERT INTO paramhw SET ?', params.hw, function(err, result) {
                                if (err) {
                                    logging.Error("SQL: " + query.sql + "\nERROR: " + err.message);
                                    return callback(err);
                                }

                                logging.Trace(query.sql);
                                callback();
                            });
                        },
                        insJitter: function(callback) {
                            if (params.jt != null && params.jt != "-1")
                                var query = connection.query('INSERT INTO jitter SET ?', params.jt, function(err, result) {
                                    if (err) {
                                        logging.Error("SQL: " + query.sql + "\nERROR: " + err.message);
                                        return callback(err);
                                    }

                                    logging.Trace(query.sql);
                                    callback();
                                });
                        }
                    }, function(err) {
                        connection.end();

                        if (err)
                            f({ error: err, data: params });
                        else
                            f({ error: null, data: params });
                    });
                }
            });
        }
    });
};
/********************************************************/
/*	FUNCTION: getRangeAts 								*/
/*	DESCRIPTION: Get ats ranges 						*/
/*  PARAMS: rsc: resId 									*/
/*			f: callback function 						*/
/*  REV 1.0.2 VMG										*/
/********************************************************/
exports.getRangeAts = function getRangeAts(rsc, f) {
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
            
            //Metemos el alias y el id para mantener la compatibilidad al mostrar los datos en la tabla del cliente
            //ShowRangeAts(data); en hardware.js
            var query = connection.query('SELECT rango_ats_inicial as inicial, rango_ats_final as final, tipo ' +
                'FROM rangos_ats ' +
                'WHERE recurso_telefonico_id=?', [rsc],
                function(err, rows) {
                    logging.Trace(query.sql);
                    connection.end();

                    if (err || rows.length == 0) {
                        return f(err ? err : 'NO_DATA');
                    }

                    f({ error: err, ranks: rows });
                });
        }
    });
};

/********************************************************/
/*	FUNCTION: getRadioWBList 							*/
/*	DESCRIPTION: Get Black and White Lists				*/
/*  PARAMS: rsc: resId 									*/
/*			f: callback function 						*/
/*  REV 1.0.2 VMG										*/
/********************************************************/
exports.getRadioWBList = function getRadioWBList(rsc, listType, f) {
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
            
            //Metemos el alias y el id para mantener la compatibilidad al mostrar los datos en la tabla del cliente
            //ShowRangeAts(data); en hardware.js
            var query = connection.query('SELECT uri,tipo ' +
                'FROM lista_uris ' +
                'WHERE recurso_radio_id=?', [rsc],
                function(err, rows) {
                    logging.Trace(query.sql);
                    connection.end();

                    if (err || rows.length == 0) {
                        return f(err ? err : 'NO_DATA');
                    }
                    else
                        return f({ error: null, list: rows });
                });
        }
    });
};

exports.getRangeAtsByParam = function getRangeAtsByParam(idParam, f) {
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
            

            var query = connection.query('SELECT * FROM rangos ' +
                'WHERE PARAMTELEF_idPARAMTELEF=?', idParam, function(err, rows, fields) {

                    logging.Trace(query.sql);
                    connection.end();

                    if (err || rows.length == 0) {
                        return f(null);
                    }

                    f(rows[0].PARAMTELEF_idPARAMTELEF);
                });
        }
    });
};

exports.postRangeAts = function postRangeAts(rsc, range, f) {
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
            

            async.waterfall([
                // Select idParamTelef
                function(callback) {
                    var query = connection.query('SELECT idPARAMTELEF FROM paramtelef WHERE RECURSO_idRECURSO=?', rsc, function(err, rows, fields) {
                        logging.Trace(query.sql);

                        if (err || rows.length == 0)
                            return callback(err);

                        if (rows.length > 0) {
                            return callback(null, rows[0].idPARAMTELEF);
                        }
                    });
                },
                // Insert Rank
                function(idParam, callback) {
                    var query = connection.query('INSERT INTO rangos SET PARAMTELEF_idPARAMTELEF=?,origen=?,inicial=?,final=?', [idParam, range.origen, range.inicial, range.final], function(err, result) {
                        logging.Trace(query.sql);

                        if (err) {
                            logging.Error("SQL: " + query.sql + "\nERROR: " + err.message);
                            return callback(err);
                        }

                        callback();
                    });
                }
            ], function(err) {
                connection.end();

                if (err)
                    return f({ error: err, data: null });

                f({ error: null, data: range });
            });
        }
    });
};

exports.putRangeAts = function putRangeAts(range, f) {
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
            

            var query = connection.query('UPDATE rangos SET ? ' +
                'WHERE idRangos=?', [range, range.idRangos], function(err, result) {

                    logging.Trace(query.sql);
                    connection.end();

                    if (err) {
                        logging.Error("SQL: " + query.sql + "\nERROR: " + err.message);
                        return f({ error: err, ranks: range });
                    }

                    f({ error: err, ranks: range });
                });
        }
    });
};

exports.deleteRangeAts = function deleteRangeAts(range, f) {
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
            

            var query = connection.query('DELETE FROM rangos WHERE idRangos=?', range, function(err, result) {

                logging.Trace(query.sql);
                connection.end();

                if (err) {
                    logging.Error("SQL: " + query.sql + "\nERROR: " + err.message);
                    return f({ error: err, ranks: range });
                }

                f({ error: err, ranks: range });
            });
        }
    });
};

exports.getUriList = function getUriList(f) {
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
            

            var query = connection.query('SELECT * FROM URILISTAS', function(err, rows, fields) {
                connection.end();
                logging.Trace(query.sql);
                if (err || rows.length == 0) {
                    return f(err ? err : 'NO_DATA');
                }

                f({ error: err, uris: rows });
            });
        }
    });
};


exports.getAssignedUriList = function getAssignedUriList(resource, tipolista, f) {
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
            
            if (tipolista == 1) { //lista negra
                var query = connection.query('SELECT U.idURILISTAS, U.ip FROM ug5k.urilistas U ' +
                    'WHERE U.idURILISTAS not in (SELECT L.URILISTAS_idURILISTAS FROM ug5k.listanegra L WHERE L.RECURSO_idRECURSO=?)',
                    resource, function(err, rows, fields) {
                        connection.end();
                        logging.Trace(query.sql);
                        if (err || rows.length == 0) {
                            return f(err ? err : 'NO_DATA');
                        }
                        f({ error: err, uris: rows });
                    });
            }
            else {
                if (tipolista == 2) { //lista blanca
                    query = connection.query('SELECT U.idURILISTAS, U.ip FROM ug5k.urilistas U ' +
                        'WHERE U.idURILISTAS not in (SELECT L.URILISTAS_idURILISTAS FROM ug5k.listablanca L WHERE L.RECURSO_idRECURSO=?)',
                        resource, function(err, rows, fields) {
                            connection.end();
                            logging.Trace(query.sql);
                            if (err || rows.length == 0) {
                                return f(err ? err : 'NO_DATA');
                            }

                            f({ error: err, uris: rows });
                        });
                }
            }
        }
    });
};

exports.postUriList = function postUriList(uri, f) {
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
            

            var query = connection.query('INSERT INTO URILISTAS SET ?', uri, function(err, result) {
                logging.Trace(query.sql);

                if (err) {
                    logging.Error("SQL: " + query.sql + "\nERROR: " + err.message);
                    connection.end();
                    return f({ error: err, data: null });
                }

                connection.end();
                logging.Trace(query.sql);
                f({ error: null, data: result.insertId });
            });
        }
    });
};

exports.deleteUriList = function deleteUriList(uri, f) {
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
            

            var query = connection.query('DELETE FROM URILISTAS WHERE ?', uri, function(err, result) {

                if (err) {
                    logging.Error("SQL: " + query.sql + "\nERROR: " + err.message);
                    return f({ error: err, data: null });
                }

                logging.Trace(query.sql);
                f({ error: null, data: uri });

                connection.end();
            });
        }
    });
};

exports.getListsFromResource = function getListsFromResource(rsc, f) {
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
            

            var query = connection.query('SELECT u.idURILISTAS, u.ip, 1 as negra FROM URILISTAS u INNER JOIN listanegra ln ON ln.URILISTAS_idURILISTAS=u.idURILISTAS ' +
                'WHERE ln.RECURSO_idRECURSO=? ' +
                'UNION ' +
                'SELECT u.idURILISTAS, u.ip, 0 as negra FROM URILISTAS u INNER JOIN listablanca lb ON lb.URILISTAS_idURILISTAS=u.idURILISTAS ' +
                'WHERE lb.RECURSO_idRECURSO=?', [rsc, rsc], function(err, rows, fields) {
                    connection.end();
                    logging.Trace(query.sql);
                    if (err || rows.length == 0) {
                        return f(err ? err : 'NO_DATA');
                    }

                    f({ error: err, uris: rows });
                });
        }
    });
};

exports.postUriToResource = function postUriToResource(rsc, uri, f) {
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
                listablanca: function(callback) {
                    var query = '';
                    if (uri.white) {
                        query = connection.query('INSERT INTO LISTABLANCA SET ?', { RECURSO_idRECURSO: rsc, URILISTAS_idURILISTAS: uri.idURILISTAS }, function(err, result) {
                            logging.Trace(query.sql);
                            if (err) {
                                logging.Error("SQL: " + query.sql + "\nERROR: " + err.message);
                                return callback(err);
                            }

                            callback();
                        });
                    }
                    else
                        callback();
                },
                listanegra: function(callback) {
                    var query = '';
                    if (uri.black) {
                        query = connection.query('INSERT INTO LISTANEGRA SET ?', { RECURSO_idRECURSO: rsc, URILISTAS_idURILISTAS: uri.idURILISTAS }, function(err, result) {
                            logging.Trace(query.sql);
                            if (err) {
                                logging.Error("SQL: " + query.sql + "\nERROR: " + err.message);
                                return callback(err);
                            }

                            callback();
                        });
                    }
                    else
                        callback();
                }
            },
                function(err) {
                    connection.end();

                    if (err)
                        f({ error: err, data: null });
                    else
                        f({ error: null, data: uri });
                }
            );
        }
    });
};

exports.deleteUriToResource = function deleteUriToResource(rsc, uri, f) {
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
                listablanca: function(callback) {
                    if (uri.white) {
                        var query = '';
                        query = connection.query('DELETE FROM LISTABLANCA WHERE RECURSO_idRECURSO=? AND ' +
                            'URILISTAS_idURILISTAS=?', [rsc, uri.idURILISTAS], function(err, result) {
                                logging.Trace(query.sql);
                                if (err) {
                                    logging.Error("SQL: " + query.sql + "\nERROR: " + err.message);
                                    return callback(err);
                                }
                            });
                    }
                    callback();
                },
                listanegra: function(callback) {
                    if (uri.black) {
                        var query = '';
                        query = connection.query('DELETE FROM LISTANEGRA WHERE RECURSO_idRECURSO=? AND ' +
                            'URILISTAS_idURILISTAS=?', [rsc, uri.idURILISTAS], function(err, result) {
                                logging.Trace(query.sql);
                                if (err) {
                                    logging.Error("SQL: " + query.sql + "\nERROR: " + err.message);
                                    return callback(err);
                                }
                            });
                    }
                    callback();
                }
            },
                function(err) {
                    connection.end();

                    if (err)
                        f({ error: err, data: null });
                    else
                        f({ error: null, data: uri });
                }
            );
        }
    });
};

exports.getUriByIp = function getUriByIp(ip, f) {
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
            

            var query = connection.query('SELECT * FROM URILISTAS WHERE ip=?', ip, function(err, rows, fields) {
                connection.end();
                logging.Trace(query.sql);
                if (err || rows.length == 0) {
                    return f(null);
                }


                f(rows[0]);
            });
        }
    });
};

/********************************************************/
/*	FUNCTION: getHardware 								*/
/*	DESCRIPTION: Get gateway hardware configuration 	*/
/*  PARAMS: gtw: gatewayIp 								*/
/*			f: callback function 						*/
/*  REV 1.0.2 VMG										*/
/********************************************************/
exports.getResourceUriList = function getResourceUriList(rscId, f) {
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
            

            var query = connection.query('SELECT tipo, uri,nivel_colateral FROM lista_uris WHERE recurso_radio_id=?',
                [rscId], function(err, rows) {
                    if (err || rows.length == 0) {
                        connection.end();
                        return f({ error: (err ? err : 'NO_DATA'), uris: null });
                    }
                    connection.end();
                    logging.Trace(query.sql);
                    f({ error: err, uris: rows });
                });
        }
    });
};

exports.postResourceUris = function postResourceUris(uri, f) {
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
            

            var query = connection.query('INSERT INTO ubicaciones SET ?', uri, function(err, result) {

                if (err) {
                    logging.Error("SQL: " + query.sql + "\nERROR: " + err.message);
                    connection.end();
                    return f({ error: (err ? err : 'NO_DATA'), uris: null });
                }

                logging.Trace(query.sql);
                f({ error: err, uris: uri });

                connection.end();
            });
        }
    });
};

exports.putResourceUris = function putResourceUris(uri, f) {
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
            

            var query = connection.query('UPDATE ubicaciones SET ? WHERE idUBICACIONES=?', [uri, uri.idUBICACIONES], function(err, result) {

                if (err) {
                    logging.Error("SQL: " + query.sql + "\nERROR: " + err.message);
                    connection.end();
                    return f({ error: (err ? err : 'NO_DATA'), uris: null });
                }

                logging.Trace(query.sql);
                f({ error: err, uris: uri });

                connection.end();
            });
        }
    });
};

exports.deleteUrisBelongingResource = function deleteUrisBelongingResource(rsc, f) {
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
            

            var query = connection.query('DELETE FROM ubicaciones WHERE RECURSO_idRECURSO=?', rsc, function(err, result) {

                if (err) {
                    logging.Error("SQL: " + query.sql + "\nERROR: " + err.message);
                    connection.end();
                    return f({ error: (err ? err : 'NO_DATA'), uris: null });
                }

                logging.Trace(query.sql);
                f({ error: err, uris: '' });

                connection.end();
            });
        }
    });
};

exports.postResourceUris = function postResourceUris(uri, f) {
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
            

            var query = connection.query('INSERT INTO ubicaciones SET ?', uri, function(err, result) {

                if (err) {
                    logging.Error("SQL: " + query.sql + "\nERROR: " + err.message);
                    connection.end();
                    return f({ error: (err ? err : 'NO_DATA'), uris: null });
                }

                logging.Trace(query.sql);
                f({ error: err, uris: uri });

                connection.end();
            });
        }
    });
};

exports.deleteResourceUri = function deleteResourceUri(rsc, uri, f) {
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
            

            var query = connection.query('DELETE FROM ubicaciones WHERE idUBICACIONES=? AND RECURSO_idRECURSO=?', [uri, rsc], function(err, result) {

                if (err) {
                    logging.Error("SQL: " + query.sql + "\nERROR: " + err.message);
                    connection.end();
                    return f({ error: (err ? err : 'NO_DATA'), uris: null });
                }

                logging.Trace(query.sql);
                f({ error: err, uris: null });

                connection.end();
            });
        }
    });
};

/********************************************************/
/*	FUNCTION: getRemoteRadioResources 					*/
/*	DESCRIPTION: Delete radio resource (all items 		*/
/*		associate on cascade will be deleted too)		*/
/*  PARAMS: idResource: resourceId 						*/
/*			res: result			 						*/
/*  REV 1.0.2 VMG										*/
/********************************************************/
exports.getRemoteRadioResources = function getRemoteRadioResources(cfg, site, gtw, resId, f) {
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
            
            var query = '';
            if (cfg != "null") {
                query = connection.query('SELECT idemplazamiento, nombre as eName ' +
                    'FROM emplazamientos ' +
                    'WHERE configuracion_id=?', [cfg],
                    function(err, result) {
                        logging.Trace(query.sql);
                        connection.end();
                        if (err || result.length == 0) {
                            return f({ error: (err ? err : 'NO_DATA'), data: null });
                        }
                        else {
                            logging.Trace(query.sql);
                            return f({ error: err, data: result });
                        }
                    });
            }
            if (site != "null") {
                query = connection.query('SELECT idpasarela, nombre as gName ' +
                    'FROM pasarelas ' +
                    'WHERE emplazamiento_id=?', [site],
                    function(err, result) {
                        logging.Trace(query.sql);
                        connection.end();
                        if (err || result.length == 0) {
                            return f({ error: (err ? err : 'NO_DATA'), data: null });
                        }
                        else {
                            logging.Trace(query.sql);
                            return f({ error: err, data: result });
                        }
                    });
            }
            if (gtw != "null") {
                query = connection.query('SELECT rr.nombre as rName, p.ip_virtual as gIpv, p.puerto_sip ' +
                    'FROM recursos_radio rr ' +
                    'RIGHT JOIN pasarelas p ON rr.pasarela_id=p.idpasarela ' +
                    'WHERE pasarela_id = ?' +
                    'AND tipo_agente >= 4 ' +
                    'AND idrecurso_radio <> ?', [gtw, resId],
                    function(err, result) {
                        logging.Trace(query.sql);
                        connection.end();
                        if (err || result.length == 0) {
                            return f({ error: (err ? err : 'NO_DATA'), data: null });
                        }
                        else {
                            logging.Trace(query.sql);
                            return f({ error: err, data: result });
                        }
                    });
            }
        }
    });
    /*if (cfg == "null")
        select='SELECT cf.name as cfName,e.name as eName,c.name as gName, r.name as rName,c.ipv as gIpv FROM recurso r ' +
                                    'INNER JOIN paramradio pr on pr.tipo >=4 AND pr.RECURSO_idRECURSO = r.idRECURSO ' +
                                    'INNER JOIN pos p ON p.idPOS=r.POS_idPOS ' +
                                    'INNER JOIN hardware h ON h.SLAVES_idSLAVES=p.SLAVES_idSLAVES ' +
                                    'INNER JOIN cgw c ON c.idCGW=h.CGW_idCGW ' +
                                    'INNER JOIN emplazamiento e ON e.idEMPLAZAMIENTO=c.EMPLAZAMIENTO_idEMPLAZAMIENTO ' +
                                    'INNER JOIN cfg cf ON cf.idCFG=e.CFG_idCFG ' +
                                    'ORDER BY cfName,eName,gName';
    else if (site == "null")
        select='SELECT cf.name as cfName,e.name as eName,c.name as gName, r.name as rName,c.ipv as gIpv FROM recurso r ' +
                                    'INNER JOIN paramradio pr on pr.tipo >=4 AND pr.RECURSO_idRECURSO = r.idRECURSO ' +
                                    'INNER JOIN pos p ON p.idPOS=r.POS_idPOS ' +
                                    'INNER JOIN hardware h ON h.SLAVES_idSLAVES=p.SLAVES_idSLAVES ' +
                                    'INNER JOIN cgw c ON c.idCGW=h.CGW_idCGW ' +
                                    'INNER JOIN emplazamiento e ON e.idEMPLAZAMIENTO=c.EMPLAZAMIENTO_idEMPLAZAMIENTO ' +
                                    'INNER JOIN cfg cf ON cf.idCFG=e.CFG_idCFG ' +
                                    'WHERE cf.name=\'' + cfg + '\' ' +
                                    'ORDER BY cfName,eName,gName';
    else if (gtw == "null")
        select='SELECT cf.name as cfName,e.name as eName,c.name as gName, r.name as rName,c.ipv as gIpv FROM recurso r ' +
                                    'INNER JOIN paramradio pr on pr.tipo >=4 AND pr.RECURSO_idRECURSO = r.idRECURSO ' +
                                    'INNER JOIN pos p ON p.idPOS=r.POS_idPOS ' +
                                    'INNER JOIN hardware h ON h.SLAVES_idSLAVES=p.SLAVES_idSLAVES ' +
                                    'INNER JOIN cgw c ON c.idCGW=h.CGW_idCGW ' +
                                    'INNER JOIN emplazamiento e ON e.idEMPLAZAMIENTO=c.EMPLAZAMIENTO_idEMPLAZAMIENTO ' +
                                    'INNER JOIN cfg cf ON cf.idCFG=e.CFG_idCFG ' +
                                    'WHERE cf.name=\'' + cfg + '\' AND e.name=\'' + site + '\' ' +
                                    'ORDER BY cfName,eName,gName';
    else
        select='SELECT cf.name as cfName,e.name as eName,c.name as gName, r.name as rName,c.ipv as gIpv FROM recurso r ' +
                                    'INNER JOIN paramradio pr on pr.tipo >=4 AND pr.RECURSO_idRECURSO = r.idRECURSO ' +
                                    'INNER JOIN pos p ON p.idPOS=r.POS_idPOS ' +
                                    'INNER JOIN hardware h ON h.SLAVES_idSLAVES=p.SLAVES_idSLAVES ' +
                                    'INNER JOIN cgw c ON c.idCGW=h.CGW_idCGW ' +
                                    'INNER JOIN emplazamiento e ON e.idEMPLAZAMIENTO=c.EMPLAZAMIENTO_idEMPLAZAMIENTO ' +
                                    'INNER JOIN cfg cf ON cf.idCFG=e.CFG_idCFG ' +
                                    'WHERE cf.name=\'' + cfg + '\' AND e.name=\'' + site + '\' AND c.name=\'' + gtw + '\' ' +
                                    'ORDER BY cfName,eName,gName';


/*		query = connection.query(select,  function(err, rows, fields) {
        connection.end();	

        if (err || rows.length == 0){
            return f({error: (err ? err : 'NO_DATA'), data: null});
        }

        logging.Trace(query.sql);
        f({error: err, data: rows});
    });
}
});*/
};

/****************************************/
/*	FUNCTION: getTelephonicResources	*/
/*  PARAMS: cfg: idSourceConfig			*/
/*			site: site id				*/
/*			gtw: gtw id 	 			*/
/*			f: callback 	 			*/
/*										*/
/*  REV 1.0.2 VMG						*/
/****************************************/
exports.getTelephonicResources = function getTelephonicResources(cfg, site, gtw, radioId, f) {
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
            

            var select = '';
            if (gtw == "null")
                select = 'SELECT p.idpasarela,c.nombre as cfName,e.nombre as eName,p.nombre as gName,' +
                    'r.nombre as rName,p.ip_virtual as gIpv ' +
                    'FROM pasarelas p ' +
                    'LEFT JOIN emplazamientos e ON p.emplazamiento_id=e.idemplazamiento ' +
                    'LEFT JOIN configuraciones c ON e.configuracion_id=c.idconfiguracion ' +
                    'RIGHT JOIN recursos_telefono r ON p.idpasarela=r.pasarela_id ' +
                    'WHERE p.emplazamiento_id=' + site;
            else
                select = 'SELECT p.idpasarela,c.nombre as cfName,e.nombre as eName,p.nombre as gName,' +
                    'r.nombre as rName,p.ip_virtual as gIpv ' +
                    'FROM pasarelas p ' +
                    'LEFT JOIN emplazamientos e ON p.emplazamiento_id=e.idemplazamiento ' +
                    'LEFT JOIN configuraciones c ON e.configuracion_id=c.idconfiguracion ' +
                    'RIGHT JOIN recursos_telefono r ON p.idpasarela=r.pasarela_id ' +
                    'WHERE p.idpasarela=' + gtw + ' AND r.idrecurso_telefono NOT LIKE ' + radioId;


            query = connection.query(select, function(err, rows, fields) {
                connection.end();

                if (err || rows.length == 0) {
                    return f({ error: (err ? err : 'NO_DATA'), data: null });
                }

                logging.Trace(query.sql);
                f({ error: err, data: rows });
            });
        }
    });
};