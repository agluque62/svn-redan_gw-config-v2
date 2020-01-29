var mySql = require('mySql');
var gcfg = require('../configUlises.json');
var logging = require('./nu-log.js');
var log = gcfg.Ulises.dblogEnable != undefined ? gcfg.Ulises.dblogEnable : true; 

if (!global.QueryCount) global.QueryCount = 0;

function Query(query, param1, cbRes, nolog) {
    var QueryCount = (++global.QueryCount);
    var connection = GetDbConnection();

    logging.Trace(log, BuildStrQuery(QueryCount, query, param1));
    connection.connect(function(mysqlerr) {
        if (mysqlerr) {
            logging.Trace(log, BuildStrResult(mysqlerr));
            cbRes(mysqlerr);
            connection.end();
        }
        else {
            connection.query(query, param1, function(mysqlerr, rows, fields) {
                connection.end();
                logging.Trace(log && !nolog, BuildStrResult(QueryCount, mysqlerr, rows));
                cbRes(mysqlerr, rows, fields);
            });
        }
    });
}

function QueryWithPromise(query, param1, nolog) {
    return new Promise(function(resolve, rejects) {
        Query(query, param1, function(err, rows, fields) {
            if (err) {
                resolve({ error: err });
            }
            else {
                resolve({ error: null, data: rows });
            }
        }, nolog);
    });
}

async function QuerySync(query, param1, nolog) {
    var res = await QueryWithPromise(query, param1, nolog);
    return res;
}

//
async function QueryMultiInsertSync(query, par) {
    var qrys = await QueryWithPromise(query, null, false);
	/* if (Array.isArray(qrys.data)) {
		var ret = [];
		qrys.data.forEach(function(item,index){
			ret.push(item.insertId);
		});
		return ret;	
	}*/
    return qrys;
}

//
function BuildStrQuery(QueryCount, query, param) {
    var res = "[UG5KDBV2] Query(" + QueryCount.toString() + "): ";
    if (query) res += (query + " ");
    if (param) {
        res += "PAR: ";
        if (Array.isArray(param)) {
            param.forEach(function(item, index) {
                res += (JSON.stringify(item) + ", ");
            });
        }
        else {
            res += (JSON.stringify(param) + ", ");
        }
    }
    res += "==>";
    return res;
}

function BuildStrResult(QueryCount, err, result) {
    var res = "[UG5KDBV2] RES(" + QueryCount.toString() + "): ";
    if (err) {
        res += ("ERROR: " + err);
    }
    else {
        if (!Array.isArray(result)) {
            res += JSON.stringify(result);
        }
        else {
            result.forEach(function(item, index) {
                res += (JSON.stringify(item) + '\r\n');
            });
        }
    }
    return res;
}

function BuildStrResultCount(QueryCount, err, result) {
    var res = "[UG5KDBV2] RES(" + QueryCount.toString() + "): ";
    if (err) {
        res += ("ERROR: " + err);
    }
    else {
        if (Array.isArray(result)) {
            res += (result.length.toString() + " Registros Leidos");
        }
    }
    return res;
}

// 20180829. Unificar la creacion de conexiones 
function GetDbConnection() {
    return mySql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_BASE,
        multipleStatements: true
    });
}

function GetDbConnectionOnTz(tz) {
    return mySql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_BASE,
        multipleStatements: true,
        timezone: tz
    });

}

/**/
exports.Query = Query;
exports.QueryWithPromise = QueryWithPromise;
exports.QuerySync = QuerySync;
exports.QueryMultiInsertSync = QueryMultiInsertSync;
exports.GetDbConnection = GetDbConnection;
exports.GetDbConnectionOnTz = GetDbConnectionOnTz;
