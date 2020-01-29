var gcfg = require('../configUlises.json');
var ug5kdb = require('./ug5kdb.js');
var logging = require('./nu-log.js');

//
async function CfgReport(cfgid, cb) {

    var res = {};

    var gwQuery = 'SELECT c.nombre as cfg, g.idpasarela, g.nombre as gw, e.nombre as site ' +
        'FROM configuraciones c, pasarelas g, emplazamientos e ' +
        ' WHERE g.emplazamiento_id = e.idemplazamiento AND ' +
        'e.configuracion_id = c.idconfiguracion AND ' +
        'c.idconfiguracion = \'' + cfgid + '\' ' +
        'ORDER BY site ASC, gw;';

    // Lista de Pasarelas que corresponden a la configuracion...			  	
    var gws = await ug5kdb.QuerySync(gwQuery, null);
    res.gws = gws.data;

    for (i = 0; i < gws.data.length; i++) {

        // Obtengo los recursos Radio de cada Pasarela...
        var rdQuery = 'SELECT idrecurso_radio, fila, columna, nombre, frecuencia, tipo_agente ' +
            'FROM recursos_radio ' +
            'WHERE pasarela_id = \'' + gws.data[i].idpasarela + '\' ;';
        var radios = await ug5kdb.QuerySync(rdQuery, null);
        res.gws[i].radios = radios.data;

        for (r = 0; r < radios.data.length; r++) {
            // Obtengo los colaterales asociados a cada recurso radio.
            var rdColQuery = 'SELECT uri, tipo, nivel_colateral ' +
                'FROM lista_uris ' +
                'WHERE nivel_colateral <> 0 AND recurso_radio_id = \'' + radios.data[r].idrecurso_radio + '\';';
            var rdcol = await ug5kdb.QuerySync(rdColQuery, null);
            res.gws[i].radios[r].col = rdcol.data;

        }
        // Obtengo los recursos Telefónicos de cada Pasarela...
        var telQuery = 'SELECT idrecurso_telefono, fila, columna, nombre, tipo_interfaz_tel, uri_telefonica ' +
            'FROM recursos_telefono ' +
            'WHERE pasarela_id = \'' + gws.data[i].idpasarela + '\'';
        var ittel = await ug5kdb.QuerySync(telQuery, null);
        res.gws[i].telef = ittel.data;
    }
    //var lst = PrepareCfgReport(res.gws);
    //cb (lst);
    cb(res.gws);
}

//
function PrepareCfgReport(gws) {
    var res = {};
    res.result = [];
    for (igw = 0; igw < gws.length; igw++) {
        var gw = gws[igw];
        for (ir = 0; ir < gw.radios.length; ir++) {
            var rd = gw.radios[ir];
            res.result.push(
                {
                    cfg_name: gw.cfg,
                    cgw_name: gw.gw,
                    slave: rd.columna,
                    posicion: rd.fila,
                    resource_name: rd.nombre,
                    resource_tipo: 1,
                    destination_name: rd.frecuencia,
                    tipo_rad: rd.tipo_agente.toString(),
                    colaterales: ""
                });
        }

        for (it = 0; it < gw.telef.length; it++) {
            var tl = gw.telef[it];
            res.result.push(
                {
                    cfg_name: gw.cfg,
                    cgw_name: gw.gw,
                    slave: rd.columna,
                    posicion: tl.fila,
                    resource_name: tl.nombre,
                    resource_tipo: 2,
                    destination_name: "",
                    tipo_tel: tl.tipo_interfaz_tel.toString(),
                    uri_remota: tl.uri_telefonica
                });
        }
    }
    return res;
}

exports.CfgReport = CfgReport;