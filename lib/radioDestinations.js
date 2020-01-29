var async = require('async');
var logging = require('./nu-log.js');

/** AGL */
var gcfg = require('../configUlises.json');
var ug5kdb = require('./ug5kdb.js');

/************************************/
/*	FUNCTION: getRadioDestinations 	*/
/*  PARAMS: 						*/
/************************************/
exports.getRadioDestinations = function getRadioDestinations(f) {
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
            

            var query = connection.query('SELECT * FROM destinos ORDER BY name', function(err, rows, fields) {

                connection.end();
                if (err || rows.length == 0) {
                    return f({ err: (err ? err : 'NO_DATA'), destinations: null });
                }

                logging.Trace(query.sql);
                f({ error: err, destinations: rows });
            });
        }
    });
};

exports.getRadioDestination = function getRadioDestination(dst, f) {
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
            

            var query = connection.query('SELECT D.*,R.name as resourceName,R.idRECURSO as idRecurso FROM destinos D ' +
                'LEFT JOIN colateral C on C.DESTINOS_idDESTINOS=D.idDESTINOS ' +
                'LEFT JOIN recurso R on R.idRECURSO=C.RECURSO_idRECURSO ' +
                'WHERE D.idDESTINOS=?', dst, function(err, rows, fields) {

                    connection.end();
                    if (err || rows.length == 0) {
                        return f({ error: (err ? err : 'NO_DATA'), destination: null });
                    }

                    logging.Trace(query.sql);
                    f({ error: err, destination: rows[0] });
                });
        }
    });
};

exports.postRadioDestination = function postRadioDestination(dst, f) {
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
            

            var query = connection.query('INSERT INTO destinos SET ?', dst, function(err, result) {
                logging.Trace(query.sql);

                if (err)
                    f({ error: err });
                else {
                    dst.idDESTINOS = result.insertId;
                    f({ error: err, destination: dst });
                }

                connection.end();
            });
        }
    });
};

exports.putDestination = function putDestination(idDestination, dst, f) {
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
            

            var query = connection.query('UPDATE DESTINOS SET ? WHERE idDESTINOS=?', [dst, idDestination], function(err, result) {
                logging.Trace(query.sql);

                if (err)
                    f({ error: err });
                else
                    f({ error: err, destination: dst });

                connection.end();
            });
        }
    });
};

exports.deleteDestination = function deleteDestination(dst, f) {
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
            

            var query = connection.query('DELETE FROM destinos WHERE idDESTINOS=? AND (? NOT IN (SELECT DESTINOS_idDESTINOS FROM colateral))',
                [dst, dst], function(err, result) {
                    logging.Trace(query.sql);

                    if (err)
                        f({ error: err });
                    else
                        f({ error: err, destination: result.affectedRows });

                    connection.end();
                });
        }
    });
};

exports.postResourceToRadioDestination = function postResourceToRadioDestination(rsc, dst, f) {
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
            

            // REPLACE destinos VALUE (dst,0),function(err,result){
            var querySelect = connection.query('SELECT idDESTINOS FROM destinos WHERE name=?', dst, function(err, rows) {
                if (err == null) {
                    if (rows.length == 0) {
                        queryDelete = connection.query('INSERT INTO destinos SET name=?,tipoConmutacion=0', dst, function(err, resultDest) {
                            if (err == null) {
                                var query = connection.query('INSERT INTO colateral SET DESTINOS_idDESTINOS=?,RECURSO_idRECURSO=?', [resultDest.insertId, rsc], function(err, result) {
                                    logging.Trace(query.sql);

                                    if (err)
                                        f({ error: err });
                                    else
                                        f({ error: err, colateral: { DESTINOS_idDESTINOS: resultDest.insertId, RECURSO_idRECURSO: rsc } });

                                    connection.end();
                                });
                            }
                        });
                    }
                    else {
                        var query = connection.query('INSERT INTO colateral SET DESTINOS_idDESTINOS=?,RECURSO_idRECURSO=?', [rows[0].idDESTINOS, rsc], function(err, result) {
                            logging.Trace(query.sql);

                            if (err)
                                f({ error: err });
                            else
                                f({ error: err, colateral: { DESTINOS_idDESTINOS: rows[0].idDESTINOS, RECURSO_idRECURSO: rsc } });

                            connection.end();
                        });
                    }
                }
            });
        }
    });
};

exports.deleteResourceFromRadioDestination = function deleteResourceFromRadioDestination(rsc, dst, f) {
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
            

            //var query = connection.query('DELETE FROM colateral WHERE DESTINOS_idDESTINOS=? AND RECURSO_idRECURSO=?', [dst,rsc], function(err, result) {
            var query = connection.query('DELETE FROM colateral WHERE RECURSO_idRECURSO=?', rsc, function(err, result) {
                logging.Trace(query.sql);

                if (err)
                    f({ error: err });
                else
                    f({ error: err, colateral: { DESTINOS_idDESTINOS: dst, RECURSO_idRECURSO: rsc } });

                connection.end();
            });
        }
    });
};

exports.getRadioDestinationAssignedToResource = function getRadioDestinationAssignedToResource(rsc, f) {
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
                destinationsData: function(callback) {
                    var query = connection.query('SELECT D.name,D.tipoConmutacion FROM destinos D ' +
                        'LEFT JOIN colateral C on C.DESTINOS_idDESTINOS=D.idDESTINOS ' +
                        'LEFT JOIN recurso R on R.idRECURSO=C.RECURSO_idRECURSO ' +
                        'WHERE R.idRECURSO=?', rsc, function(err, rows, fields) {
                            if (err)
                                return callback(err);

                            logging.Trace(query.sql);
                            callback(null, rows[0]);
                        });
                },
                sitesData: function(callback) {
                    var query = connection.query('SELECT u.uriTxA,u.uriTxB,u.activoTx,u.uriRxA,u.uriRxB,u.activoRx FROM ubicaciones u ' +
                        // 'LEFT JOIN colateral C on C.DESTINOS_idDESTINOS=u.DESTINOS_idDESTINOS ' +
                        //'LEFT JOIN recurso R on R.idRECURSO=u.RECURSO_idRECURSO ' +
                        'WHERE u.RECURSO_idRECURSO=?', rsc, function(err, rows, fields) {
                            if (err)
                                return callback(err);

                            logging.Trace(query.sql);
                            callback(null, rows);
                        });
                }
            }, function(err, results) {
                connection.end();

                if (err)
                    f({ error: (err ? err : 'NO_DATA'), destination: null });
                else {
                    if (results.destinationsData != null) {
                        var destinos = results.destinationsData;
                        destinos.emplazamientos = results.sitesData;

                        f({ error: null, destination: destinos });
                    }
                    else
                        f({ error: 'NO_DATA', destination: '' });
                }
            });
        }
    });
};

exports.getDestinationUris = function getDestinationUris(dst, f) {
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
            

            var query = connection.query('SELECT * FROM ubicaciones WHERE DESTINOS_idDESTINOS=?', dst, function(err, rows, fields) {

                connection.end();
                if (err || rows.length == 0) {
                    return f({ error: (err ? err : 'NO_DATA'), uris: null });
                }
                logging.Trace(query.sql);
                f({ error: err, uris: rows });

            });
        }
    });
};

exports.putDestinationUris = function putDestinationUris(uri, f) {
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

                connection.end();
                if (err) {
                    logging.Trace(query.sql);
                    return f({ error: (err ? err : 'NO_DATA'), uris: null });
                }
                logging.Trace(query.sql);
                f({ error: err, uris: uri });

            });
        }
    });
};

exports.deleteDestinationUris = function deleteDestinationUris(uri, f) {
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
            

            var query = connection.query('DELETE FROM ubicaciones WHERE idUBICACIONES=?', uri, function(err, result) {

                connection.end();
                if (err) {
                    return f({ error: (err ? err : 'NO_DATA'), uris: null });
                }
                logging.Trace(query.sql);
                f({ error: err, uris: uri });
            });
        }
    });
};

exports.deleteUrisBelongingDestination = function deleteUrisBelongingDestination(dest, f) {
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
            

            var query = connection.query('DELETE FROM ubicaciones WHERE DESTINOS_idDESTINOS=?', dest, function(err, result) {

                connection.end();
                if (err) {
                    logging.Trace(query.sql);
                    logging.Trace(err);
                    return f({ error: (err ? err : 'NO_DATA'), uris: null });
                }
                logging.Trace(query.sql);
                f({ error: err, uris: '' });
            });
        }
    });
};

exports.getDestinationByName = function getDestinationByName(name, f) {
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
            

            var query = connection.query('SELECT * FROM destinos WHERE name=?', name, function(err, rows, fields) {

                connection.end();
                if (err || rows.length == 0) {
                    return f({ error: (err ? err : 'NO_DATA'), destination: null });
                }
                logging.Trace(query.sql);
                f({ error: err, destination: rows[0] });
            });
        }
    });
};