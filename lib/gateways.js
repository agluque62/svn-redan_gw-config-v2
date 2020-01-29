var async = require('async');
var servicesLib = require('./services');
var myLibResources = require('./resources.js');
var myLibHardware = require('./hardware.js');
var logging = require('./nu-log.js');
var jsonTemplate = require('./jsonTemplate');
var config = require('../configUlises.json');

/** AGL */
var gcfg = require('../configUlises.json');
var ug5kdb = require('./ug5kdb.js');

function getTodayDateTimeFormatted() {
    var myDate = new Date();
    var dateTime = myDate.toString().split(" ");

    var year = dateTime[3];
    var day = dateTime[2];
    var time = dateTime[4];

    var monthNumber = myDate.getMonth() + 1;
    if (monthNumber.toString().length === 1)
        var completeMonthNumber = '0' + monthNumber.toString();

    //Format yyyy-MM-dd HH:MM:ss
    return year + '-' + completeMonthNumber + '-' + day + ' ' + time;
}

///****************************/
///*	FUNCTION: getGateways 	*/
///*  PARAMS: 				*/
///*  REV 1.0.2 VMG			*/
///****************************/
exports.changeGateWaySite = function changeGateWaySite(
    IdGateway, sourceGatewaySite, targetGatewaySite, f) {
    var mySql = require('mySql');
    var connection = ug5kdb.GetDbConnection();/* mySql.createConnection({
        host     : gcfg.Ulises.dbhost,
        user     : gcfg.Ulises.dbuser,
        password : gcfg.Ulises.dbpassword,
        database : gcfg.Ulises.dbdatabase
    });*/

    connection.connect(function(err, usrs) {
        if (err) {
            logging.Error("Error connection to 'U5K-G' database.");
        }
        else {
            var configData = {};

            var query = connection.query('SELECT COUNT(*) as cuantos ' +
                'FROM pasarelas p ' +
                'WHERE p.idpasarela=? ' +
                'AND p.nombre IN (SELECT p.nombre ' +
                'FROM pasarelas p ' +
                'WHERE p.emplazamiento_id=?)', [IdGateway, targetGatewaySite],
                function(err, rows, fields) {
                    logging.Trace(query.sql);
                    if (err) {
                        connection.end();
                        return f({ error: err.message });
                    }
                    else if (rows[0].cuantos > 0) {
                        connection.end();
                        return f({ data: 'DUP_ENTRY_NAME' });
                    }
                    else {
                        var queryUpdate = connection.query('UPDATE pasarelas SET emplazamiento_id=?, ' +
                            'pendiente_actualizar=1 WHERE idpasarela=?',
                            [targetGatewaySite, IdGateway],
                            function(err, result) {
                                logging.Trace(queryUpdate.sql);
                                connection.end();
                                if (err)
                                    return f({ error: err.message });
                                else
                                    return f({ error: null, data: 'OK' });
                            });
                    }
                }
            );
        }
    });
};

///****************************/
///*	FUNCTION: updateUsers 	*/
///*  PARAMS: 				*/
///*  REV 1.0.2 VMG			*/
///****************************/
exports.updateUsers = function updateUsers(f) {
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
            var query = connection.query('UPDATE pasarelas p ' +
                'LEFT JOIN emplazamientos e ON p.emplazamiento_id=e.idemplazamiento ' +
                'LEFT JOIN configuraciones c ON e.configuracion_id=c.idconfiguracion ' +
                'SET pendiente_actualizar=1 ' +
                'WHERE c.activa=1',
                function(err, rows, fields) {
                    logging.Trace(query.sql);
                    connection.end();
                    if (err)
                        return f({ error: err.message });
                    else
                        return f({ data: 'OK' });
                });
        }
    });
};

///****************************/
///*	FUNCTION: updateUsers 	*/
///*  PARAMS: 				*/
///*  REV 1.0.2 VMG			*/
///****************************/
exports.updateTable = function updateTable(idTable, f) {
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
            var query = connection.query('UPDATE pasarelas p ' +
                'LEFT JOIN recursos_radio rr ON p.idpasarela=rr.pasarela_id ' +
                'LEFT JOIN emplazamientos e ON p.emplazamiento_id=e.idemplazamiento ' +
                'LEFT JOIN configuraciones c ON e.configuracion_id=c.idconfiguracion ' +
                'SET pendiente_actualizar=1 ' +
                'WHERE c.activa=1 ' +
                'AND rr.tabla_bss_id=?', [idTable],
                function(err, rows, fields) {
                    logging.Trace(query.sql);
                    connection.end();
                    if (err)
                        return f({ error: err.message });
                    else
                        return f({ data: 'OK' });
                });
        }
    });
};

///********************************************************/
///*	FUNCTION: getAll 									*/
///*	DESCRIPTION: Get info about gateway 				*/
///*  PARAMS: idGtw: gateway id 							*/
///*			f: callback function 						*/
///*														*/
///* 	Obtain Async data and resources						*/
///*  REV 1.0.2 VMG										*/
///********************************************************/
exports.getAll = function getAll(configName, ipGtw, f) {

    var mySql = require('mySql');
    var connection = ug5kdb.GetDbConnectionOnTz('+02:00');/* mySql.createConnection({
        host: gcfg.Ulises.dbhost,
        user: gcfg.Ulises.dbuser,
        password: gcfg.Ulises.dbpassword,
        database: gcfg.Ulises.dbdatabase,
        timezone: '+02:00',
        multipleStatements: true
    });*/

    logging.Info("(gateways).getAll " + configName + " " + ipGtw);

    connection.connect(function(err) {
        if (err) {
            logging.Error("Error connention to 'U5K-G' database.");
        }
        else {
            var template = jsonTemplate.fillTemplate();
            var idGtw = '';
            //// CODIGO ASÍNCRONO
            //async.waterfall([
            //    selectIdGtw,
            //    selectDataPasarelas,
            //    selectDataTfno,
            //    selectDataRadio,
            //    selectListaIps,
            //    selectListaUris,
            //    selectListaRangosAts,
            //    selectTablaBss,
            //    selectListaUsers
            //], function (err, result) {
            //    connection.end();
            //    f(result, idGtw);
            //});
            var selectIdGtw = function /*selectIdGtw*/(callback) {
                if (configName != null) {
                    var query = connection.query('SELECT p.idpasarela ' +
                        'FROM pasarelas p ' +
                        'LEFT JOIN emplazamientos e ON e.idemplazamiento=p.emplazamiento_id ' +
                        'LEFT JOIN configuraciones c ON c.idconfiguracion=e.configuracion_id ' +
                        'WHERE (ip_cpu0=? ' +
                        'OR ip_cpu1=?) ' +
                        'AND c.nombre=?', [ipGtw, ipGtw, configName],
                        function(err, rows) {
                            if (err || rows.length == 0) {
                                logging.Error(err);
                                return callback(rows.length == 0 ? 'NO_DATA' : err);
                            }
                            else {
                                idGtw = rows[0].idpasarela;
                                return callback(null, idGtw);
                            }

                        });
                }
                else {
                    idGtw = ipGtw;
                    return callback(null, idGtw);
                }

            };
            var selectDataPasarelas = function /*selectDataPasarelas*/(idGtw, callback) {
                var queryPasarela = connection.query('SELECT p.nombre as name, c.nombre as idConf, ' +
                    'DATE_FORMAT(p.ultima_actualizacion, "%d/%m/%Y %H:%i:%s") as fechaHora, ' +
                    'e.nombre as emplazamiento,p.ip_virtual as ipv,p.ip_cpu0,p.ip_gtw0,p.mask_cpu0,p.ip_cpu1,p.ip_gtw1,' +
                    'p.mask_cpu1,p.puerto_sip,p.periodo_supervision,p.puerto_sip, ' +
                    'p.puerto_servicio_web,p.tiempo_sesion,p.comunidad_snmp,p.contacto_snmp,p.localizacion_snmp, ' +
                    'p.nombre_snmp,p.snmpv2,p.puerto_servicio_snmp,p.puerto_snmp,p.puerto_rtsp,p.servidor_rtsp, ' +
                    'p.servidor_rtspb, p.sppe, p.dvrrp ' +
                    'FROM pasarelas p ' +
                    'LEFT JOIN emplazamientos e ON p.emplazamiento_id=e.idemplazamiento ' +
                    'LEFT JOIN configuraciones c ON e.configuracion_id=c.idconfiguracion ' +
                    'WHERE p.idpasarela=?', [idGtw],
                    function(err, rows) {
                        if (err) {
                            logging.Error(err);
                            connection.end();
                            return f({ error: err.message });
                        }
                        else {

                            template.idConf = rows[0].idConf;
                            template.fechaHora = rows[0].fechaHora + ' UTC';
                            template.general.name = rows[0].name;
                            template.general.emplazamiento = rows[0].emplazamiento;
                            template.general.ipv = rows[0].ipv;

                            template.general.cpus[0].ipb = rows[0].ip_cpu0;
                            template.general.cpus[0].msb = rows[0].mask_cpu0;
                            template.general.cpus[0].ipg = rows[0].ip_gtw0;
                            template.general.cpus[1].ipb = rows[0].ip_cpu1;
                            template.general.cpus[1].msb = rows[0].mask_cpu1;
                            template.general.cpus[1].ipg = rows[0].ip_gtw1;

                            template.servicios.name = rows[0].idConf + '-' + rows[0].name;

                            template.servicios.sip.PuertoLocalSIP = rows[0].puerto_sip;
                            template.servicios.sip.PeriodoSupervisionSIP = rows[0].periodo_supervision;
                            template.servicios.sip.PuertoLocalSIP = rows[0].puerto_sip;
                            //TODO REGISTRARS Y PROXIES

                            template.servicios.web.wport = rows[0].puerto_servicio_web;
                            template.servicios.web.stime = rows[0].tiempo_sesion;

                            template.servicios.snmp.agcomm = rows[0].comunidad_snmp;
                            template.servicios.snmp.agcont = rows[0].contacto_snmp;
                            template.servicios.snmp.agloc = rows[0].localizacion_snmp;
                            template.servicios.snmp.agname = rows[0].nombre_snmp;
                            template.servicios.snmp.agv2 = rows[0].snmpv2;
                            template.servicios.snmp.sport = rows[0].puerto_servicio_snmp;
                            template.servicios.snmp.snmpp = rows[0].puerto_snmp;
                            //TODO Faltan los Traps

                            template.servicios.grab.rtsp_ip = rows[0].servidor_rtsp;
                            template.servicios.grab.rtspb_ip = rows[0].servidor_rtspb;
                            template.servicios.grab.rtsp_port = rows[0].puerto_rtsp;

                            //TODO Faltan los SINCR

                            //Usuarios
                            var userTemplate = jsonTemplate.fillUser();
                            template.users.push(userTemplate);

                            // NUevos parametros.
                            /** 20190219. Sincropasarela */
                            template.general.SupervisionLanGW = rows[0].sppe ? (rows[0].sppe==0 ? 0 : 1) : 0;
                            template.general.TmMaxSupervLanGW = rows[0].sppe ? (rows[0].sppe==0 ? 1 : rows[0].sppe) : 1;
                            /** */
                            template.general.dvrrp = rows[0].dvrrp ? rows[0].dvrrp : 2000;

                            return callback(null, idGtw, template);

                        }
                    });
            };
            var selectDataTfno = function /*selectDataTfno*/(idGtw, template, callback) {
                var query = connection.query('SELECT idrecurso_telefono,nombre,columna,fila,codec,clave_registro,' +
                    'ajuste_ad,ajuste_da,tipo_interfaz_tel,lado,respuesta_automatica,origen_test,destino_test, ' +
                    'periodo_tonos,uri_telefonica,deteccion_vox,umbral_vox,cola_vox,supervisa_colateral,tiempo_supervision, ' +
                    'duracion_tono_interrup, ats_user, det_inversion_pol ' +
                    'FROM recursos_telefono ' +
                    'WHERE pasarela_id=?', [idGtw],
                    function(err, rows) {
                        if (err) {
                            logging.Error(err);
                            return callback(rows.length == 0 ? 'NO_DATA' : err);
                        }
                        else {
                            for (var i = 0; i < rows.length; i++) {
                                var recurso = jsonTemplate.fillTelResource();
                                recurso.idDBRadio = '-1';
                                recurso.idDBTfno = rows[i].idrecurso_telefono;
                                recurso.IdRecurso = rows[i].nombre;
                                recurso.SlotPasarela = rows[i].columna;
                                recurso.NumDispositivoSlot = rows[i].fila;
                                template.hardware.slv[rows[i].columna].pos[rows[i].fila].tp = 1;
                                template.hardware.slv[rows[i].columna].pos[rows[i].fila].cfg = 2;
                                recurso.Codec = rows[i].codec;

                                if (rows[i].clave_registro == null) {
                                    recurso.szClave = '';
                                    recurso.enableRegistro = 0;
                                }
                                else {
                                    recurso.szClave = rows[i].clave_registro;
                                    recurso.enableRegistro = 1;
                                }
                                if (rows[i].ajuste_ad == null) {
                                    recurso.hardware.AD_Gain = '';
                                    recurso.hardware.AD_AGC = 1;
                                }
                                else {
                                    recurso.hardware.AD_Gain = rows[i].ajuste_ad * 10;//Al mandarlo a las pasarelas hay que multiplicarlo
                                    recurso.hardware.AD_AGC = 0;
                                }
                                if (rows[i].ajuste_da == null) {
                                    recurso.hardware.DA_Gain = '';
                                    recurso.hardware.DA_AGC = 1;
                                }
                                else {
                                    recurso.hardware.DA_Gain = rows[i].ajuste_da * 10;//Al mandarlo a las pasarelas hay que multiplicarlo
                                    recurso.hardware.DA_AGC = 0;
                                }
                                recurso.telefonia.tipo = rows[i].tipo_interfaz_tel;
                                recurso.telefonia.lado = rows[i].lado;
                                recurso.telefonia.r_automatica = rows[i].respuesta_automatica;
                                recurso.telefonia.no_test_local = rows[i].origen_test;
                                recurso.telefonia.no_test_remoto = rows[i].destino_test;
                                recurso.telefonia.it_release = rows[i].periodo_tonos;
                                recurso.telefonia.uri_remota = rows[i].uri_telefonica;
                                recurso.telefonia.detect_vox = rows[i].deteccion_vox;
                                recurso.telefonia.umbral_vox = rows[i].umbral_vox;
                                recurso.telefonia.tm_inactividad = rows[i].cola_vox;
                                recurso.telefonia.superv_options = rows[i].supervisa_colateral;
                                recurso.telefonia.tm_superv_options = rows[i].tiempo_supervision;
                                recurso.telefonia.iT_Int_Warning = rows[i].duracion_tono_interrup;

                                recurso.telefonia.ats_user = rows[i].ats_user;
                                /** 20190212. Ajuste URI-LOCAL segun tipo.. */
                                var UserUri = recurso.telefonia.ats_user == "" ? rows[i].nombre : recurso.telefonia.ats_user;
                                recurso.Uri_Local = 'sip:' + UserUri + '@' + template.general.ipv;

                                recurso.telefonia.iDetInversionPol = rows[i].det_inversion_pol;

                                template.recursos.push(recurso);
                            }
                            return callback(null, idGtw, template);
                        }
                    }
                );
            };
            var selectDataRadio = function /*selectDataRadio*/(idGtw, template, callback) {
                var query = connection.query('SELECT idrecurso_radio,nombre,columna,fila,codec,clave_registro,ajuste_ad, ' +
                    'ajuste_da,min_jitter,max_jitter,tipo_agente,indicacion_entrada_audio,indicacion_salida_audio, ' +
                    'climax_bss,metodo_bss,umbral_vad,tiempo_max_ptt,ventana_bss,tipo_climax,retardo_fijo_climax, ' +
                    'cola_bss_sqh,evento_ptt_squelch,retardo_jitter,retraso_interno_grs,habilita_grabacion,' +
                    'tabla_bss_id,prioridad_sesion_sip,prioridad_ptt,' +
                    'frecuencia,precision_audio,metodo_climax,restriccion_entrantes ' +
                    'FROM recursos_radio ' +
                    'WHERE pasarela_id=?', [idGtw],
                    function(err, rows) {
                        if (err) {
                            logging.Error(err);
                            return callback(rows.length == 0 ? 'NO_DATA' : err);
                        }
                        else {
                            for (var i = 0; i < rows.length; i++) {
                                var recurso = jsonTemplate.fillRadioResource();
                                recurso.idDBRadio = rows[i].idrecurso_radio;
                                recurso.idDBTfno = '-1';
                                recurso.idBss = rows[i].tabla_bss_id;
                                recurso.IdRecurso = rows[i].nombre;
                                recurso.SlotPasarela = rows[i].columna;
                                recurso.NumDispositivoSlot = rows[i].fila;
                                template.hardware.slv[rows[i].columna].pos[rows[i].fila].tp = 1;
                                template.hardware.slv[rows[i].columna].pos[rows[i].fila].cfg = 1;
                                recurso.Codec = rows[i].codec;
                                /** 20190212. Ajuste URI-LOCAL segun tipo.. */
                                recurso.Uri_Local = 'sip:' + rows[i].nombre + '@' + template.general.ipv;
                                if (rows[i].clave_registro == null) {
                                    recurso.szClave = '';
                                    recurso.enableRegistro = 0;
                                }
                                else {
                                    recurso.szClave = rows[i].clave_registro;
                                    recurso.enableRegistro = 1;
                                }
                                if (rows[i].ajuste_ad == null) {
                                    recurso.hardware.AD_Gain = '';
                                    recurso.hardware.AD_AGC = 1;
                                }
                                else {
                                    recurso.hardware.AD_Gain = rows[i].ajuste_ad * 10;//Al mandarlo a las pasarelas hay que multiplicarlo
                                    recurso.hardware.AD_AGC = 0;
                                }
                                if (rows[i].ajuste_da == null) {
                                    recurso.hardware.DA_Gain = '';
                                    recurso.hardware.DA_AGC = 1;
                                }
                                else {
                                    recurso.hardware.DA_Gain = rows[i].ajuste_da * 10;//Al mandarlo a las pasarelas hay que multiplicarlo
                                    recurso.hardware.DA_AGC = 0;
                                }
                                recurso.Buffer_jitter.min = rows[i].min_jitter;
                                recurso.Buffer_jitter.max = rows[i].max_jitter;
                                recurso.radio.tipo = rows[i].tipo_agente;
                                recurso.radio.sq = rows[i].indicacion_entrada_audio;
                                recurso.radio.ptt = rows[i].indicacion_salida_audio;
                                recurso.radio.bss = rows[i].climax_bss;
                                recurso.radio.metodoBss = rows[i].metodo_bss;
                                recurso.radio.umbralVad = rows[i].umbral_vad;
                                recurso.radio.tiempoPtt = rows[i].tiempo_max_ptt;
                                recurso.radio.climaxDelay = rows[i].tipo_climax;
                                recurso.radio.tmRetardoFijo = rows[i].retardo_fijo_climax;
                                recurso.radio.retrasoSqOff = rows[i].cola_bss_sqh;
                                recurso.radio.evtPTT = rows[i].evento_ptt_squelch;
                                recurso.radio.tjbd = rows[i].retardo_jitter;
                                recurso.radio.tGRSid = rows[i].retraso_interno_grs;
                                recurso.radio.iEnableGI = rows[i].habilita_grabacion;
                                recurso.radio.iSesionPrio = rows[i].prioridad_sesion_sip;
                                recurso.radio.iPttPrio = rows[i].prioridad_ptt;
                                recurso.radio.colateral.name = rows[i].frecuencia.toFixed(3);
                                recurso.radio.iPrecisionAudio = rows[i].precision_audio;
                                recurso.radio.iModoCalculoClimax = rows[i].metodo_climax;
                                recurso.restriccion = rows[i].restriccion_entrantes;
                                recurso.radio.tmVentanaRx = rows[i].ventana_bss;

                                template.recursos.push(recurso);
                            }
                            return callback(null, idGtw, template);
                        }
                    }
                );
            };
            var selectListaIps = function /*selectListaIps*/(idGtw, template, callback) {
                var query = connection.query('SELECT ip,tipo,selected ' +
                    'FROM lista_ips ' +
                    'WHERE pasarela_id=?', [idGtw],
                    function(err, rows) {
                        if (err) {
                            logging.Error(err);
                            return callback(rows.length == 0 ? 'NO_DATA' : err);
                        }
                        else {
                            var prxCounter = 0, regCounter = 0, ntpCounter = 0, trpCounter = 0;
                            for (var i = 0; i < rows.length; i++) {
                                if (rows[i].tipo == 'PRX') {
                                    template.servicios.sip.proxys[prxCounter].ip = rows[i].ip;
                                    template.servicios.sip.proxys[prxCounter].selected = rows[i].selected;
                                    prxCounter++;
                                }
                                if (rows[i].tipo == 'REG') {
                                    template.servicios.sip.registrars[regCounter].ip = rows[i].ip;
                                    template.servicios.sip.registrars[regCounter].selected = rows[i].selected;
                                    regCounter++;
                                }
                                if (rows[i].tipo == 'NTP') {
                                    template.servicios.sincr.servidores[ntpCounter].ip = rows[i].ip;
                                    template.servicios.sincr.servidores[ntpCounter].selected = rows[i].selected;
                                    ntpCounter++;
                                }
                                if (rows[i].tipo == 'TRPV1' || rows[i].tipo == 'TRPV2') {
                                    template.servicios.snmp.traps[trpCounter] = rows[i].ip;
                                    //template.servicios.snmp.traps[trpCounter].selected=rows[i].selected;
                                    trpCounter++;
                                }
                            }
                            return callback(null, idGtw, template);
                        }
                    }
                );
            };
            var selectListaUris = function /*selectListaUris*/(idGtw, template, callback) {
                var query = connection.query('SELECT rr.idrecurso_radio,lu.uri,lu.tipo,lu.nivel_colateral ' +
                    'FROM recursos_radio rr ' +
                    'LEFT JOIN lista_uris lu ON rr.idrecurso_radio=lu.recurso_radio_id ' +
                    'WHERE rr.pasarela_id=?', [idGtw],
                    function(err, rows) {
                        if (err) {
                            logging.Error(err);
                            return callback(rows.length == 0 ? 'NO_DATA' : err);
                        }
                        else {
                            for (var j = 0; j < template.recursos.length; j++) {
                                var blancaCounter = 0, negraCounter = 0;
                                for (var i = 0; i < rows.length; i++) {
                                    var emplazamientosCounter = 0;
                                    if (rows[i].idrecurso_radio == template.recursos[j].idDBRadio) {
                                        if (rows[i].nivel_colateral == 1 || rows[i].nivel_colateral == 2)
                                            emplazamientosCounter = 0;
                                        else if (rows[i].nivel_colateral == 3 || rows[i].nivel_colateral == 4)
                                            emplazamientosCounter = 1;
                                        else
                                            emplazamientosCounter = 2;
                                        if (rows[i].tipo == 'TXA') {
                                            template.recursos[j].radio.colateral.emplazamientos[emplazamientosCounter].uriTxA = rows[i].uri;
                                        }
                                        if (rows[i].tipo == 'RXA') {
                                            template.recursos[j].radio.colateral.emplazamientos[emplazamientosCounter].uriRxA = rows[i].uri;
                                        }
                                        if (rows[i].tipo == 'TXB') {
                                            template.recursos[j].radio.colateral.emplazamientos[emplazamientosCounter].uriTxB = rows[i].uri;
                                        }
                                        if (rows[i].tipo == 'RXB') {
                                            template.recursos[j].radio.colateral.emplazamientos[emplazamientosCounter].uriRxB = rows[i].uri;
                                        }
                                        if (rows[i].tipo == 'LSB') {
                                            template.recursos[j].blanca[blancaCounter] = rows[i].uri;
                                            blancaCounter++;
                                        }
                                        if (rows[i].tipo == 'LSN') {
                                            template.recursos[j].negra[negraCounter] = rows[i].uri;
                                            negraCounter++;
                                        }
                                    }
                                }
                            }
                            return callback(null, idGtw, template);
                        }
                    }
                );
            };
            var selectListaRangosAts = function /*selectListaRangosAts*/(idGtw, template, callback) {
                var query = connection.query('SELECT rt.idrecurso_telefono,ra.rango_ats_inicial, ' +
                    'ra.rango_ats_final,ra.tipo ' +
                    'FROM recursos_telefono rt ' +
                    'LEFT JOIN rangos_ats ra ON rt.idrecurso_telefono=ra.recurso_telefonico_id ' +
                    'WHERE rt.pasarela_id=?', [idGtw],
                    function(err, rows) {
                        if (err) {
                            logging.Error(err);
                            return callback(rows.length == 0 ? 'NO_DATA' : err);
                        }
                        else {
                            for (var j = 0; j < template.recursos.length; j++) {
                                var rangosDstCounter = 0;
                                var rangosOrgCounter = 0;
                                for (var i = 0; i < rows.length; i++) {
                                    if (rows[i].idrecurso_telefono == template.recursos[j].idDBTfno) {
                                        if (rows[i].tipo == 0) {
                                            template.recursos[j].telefonia.ats_rangos_org[rangosOrgCounter].inicial = rows[i].rango_ats_inicial;
                                            template.recursos[j].telefonia.ats_rangos_org[rangosOrgCounter].final = rows[i].rango_ats_final;
                                            rangosOrgCounter++;
                                        }
                                        if (rows[i].tipo == 1) {
                                            template.recursos[j].telefonia.ats_rangos_dst[rangosDstCounter].inicial = rows[i].rango_ats_inicial;
                                            template.recursos[j].telefonia.ats_rangos_dst[rangosDstCounter].final = rows[i].rango_ats_final;
                                            rangosDstCounter++;
                                        }
                                    }
                                }
                            }
                            return callback(null, idGtw, template);
                        }
                    }
                );
            };
            var selectTablaBss = async function /*selectTablaBss*/(idGtw, template, callback) {
                var query = '';
                for (var i = 0; i < template.recursos.length; i++) {
                    if (template.recursos[i].Radio_o_Telefonia == 1 && (template.recursos[i].radio.tipo == 4 ||
                        template.recursos[i].radio.tipo == 6) && template.recursos[i].idBss != 0) {
                        query = 'SELECT valor0,valor1,valor2,valor3,valor4,valor5 ' +
                            'FROM tablas_bss WHERE idtabla_bss=' + template.recursos[i].idBss + ';';
                        res = await ug5kdb.QueryMultiInsertSync(query);
                        if (res.error){
                            logging.Error(res.error);
                        }
                        else {
                            template.recursos[i].radio.tabla_indices_calidad[0] = res.data[0].valor0;
                            template.recursos[i].radio.tabla_indices_calidad[1] = res.data[0].valor1;
                            template.recursos[i].radio.tabla_indices_calidad[2] = res.data[0].valor2;
                            template.recursos[i].radio.tabla_indices_calidad[3] = res.data[0].valor3;
                            template.recursos[i].radio.tabla_indices_calidad[4] = res.data[0].valor4;
                            template.recursos[i].radio.tabla_indices_calidad[5] = res.data[0].valor5;
                        }
                    }
                }
                return callback(null, idGtw, template);
            };
            //TODO Falta quitar el usuario vacio
            var selectListaUsers = function /*selectListaUsers*/(idGtw, template, callback) {

                var query = connection.query('SELECT name,clave,perfil ' +
                    'FROM operadores',
                    function(err, rows) {
                        if (err) {
                            logging.Error(err);
                            connection.end();
                            return callback(rows.length == 0 ? 'NO_DATA' : err);
                        }
                        else {
                            // 20170913. AGL. ¿quitar el usuario vacio?
                            template.users = [];
                            for (var i = 0; i < rows.length; i++) {
                                var user = jsonTemplate.fillUser();

                                user.name = rows[i].name;
                                user.clave = rows[i].clave;

                                // 20170913. AGL. Perfiles permitidos en las pasarelas...
                                user.perfil = 0;
                                user.perfil |= (rows[i].perfil & 0x0080) != 0 ? 0x0001 : 0x0000;	// Perfil Visualizador.
                                user.perfil |= (rows[i].perfil & 0x0002) != 0 ? 0x0002 : 0x0000;	// Perfil Mando.
                                user.perfil |= (rows[i].perfil & 0x1000) != 0 ? 0x1000 : 0x0000;	// Perfil Gestor.
                                user.perfil |= (rows[i].perfil & 0x0100) != 0 ? 0x0040 : 0x0000;	// Perfil Administrador.

                                if (user.perfil != 0) {
                                    template.users.push(user);
                                }
                                // user.perfil = rows[i].perfil;
                                // template.users.push(user);
                                // Fin modificacion....
                            }
                            return callback(null, template);
                        }
                    }
                );
            };
            // CODIGO ASÍNCRONO
            async.waterfall([
                selectIdGtw,
                selectDataPasarelas,
                selectDataTfno,
                selectDataRadio,
                selectListaIps,
                selectListaUris,
                selectListaRangosAts,
                selectTablaBss,
                selectListaUsers
            ], function(err, result) {
                connection.end();
                f(result, idGtw);
            });
        }
    });
};

///****************************/
///*	FUNCTION: getIpv2 		*/
///*  PARAMS: ipBound			*/
///*  REV 1.0.2 VMG			*/
///****************************/
exports.getIpv2 = function getIpv2(ipBound, f) {
    var mySql = require('mySql');

    var connection = ug5kdb.GetDbConnection();/* mySql.createConnection({
        host: gcfg.Ulises.dbhost,
        user: gcfg.Ulises.dbuser,
        password: gcfg.Ulises.dbpassword,
        database: gcfg.Ulises.dbdatabase
    });*/
    var data2Res = [];
    connection.connect(function(err, usrs) {
        if (err) {
            logging.Error("Error connection to 'U5K-G' database.");
        }
        else {
            query = connection.query('SELECT c.idconfiguracion,c.nombre as idConf,c.activa, ' +
                'DATE_FORMAT(p.ultima_actualizacion, "%d/%m/%Y %H:%i:%s") as fechaHora, ' +
                'p.idpasarela, p.pendiente_actualizar ' +
                'FROM pasarelas p ' +
                'LEFT JOIN emplazamientos e ON e.idemplazamiento=p.emplazamiento_id ' +
                'LEFT JOIN configuraciones c ON c.idconfiguracion=e.configuracion_id ' +
                'WHERE ip_cpu0=? ' +
                'OR ip_cpu1=?', [ipBound, ipBound],
                function(err, rows, fields) {
                    logging.Trace(query.sql);
                    connection.end();
                    if (err != null) {
                        f({ error: err, toLocal: null, data: null, ipv: -1 });
                    }
                    else {
                        if (rows == null || rows.length == 0) {//No en BBDD
                            f({ error: null, toLocal: -1, data: null, ipv: -1 });
                        }
                        else {
                            for (var i = 0; i < rows.length; i++) {
                                var data = new Object();
                                if (rows[i].activa == 1)
                                    data.activa = 1;
                                else
                                    data.activa = 0;
                                data.idConf = rows[i].idConf;
                                data.fechaHora = rows[i].fechaHora + ' UTC';
                                data.idGtw = rows[i].idpasarela;
                                data.updatePend = rows[i].pendiente_actualizar;
                                data.idconfiguracion = rows[i].idconfiguracion;
                                data2Res.push(data);
                            }
                            f({ error: null, toLocal: 0, data: data2Res, ipv: -1 });
                            return;
                        }
                    }
                });
        }
    });
};

function altaCgwBD(ip) {
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
            var dateTime = getTodayDateTimeFormatted();
            var dummyCfg = {
                name: 'CFG-DEF',
                description: 'Nuevas Configuraciones',
                activa: '1',
                ts_activa: dateTime
            };

            var query = connection.query('SELECT idCFG,activa FROM cfg WHERE name=?', dummyCfg.name, function(err, rows, fields) {
                if (err) {
                    logging.Trace(query.sql);
                    f(false);
                }
                else if (rows.length > 0) {
                    connection.end();
                }
                else {
                    var queryInsertCfg = connection.query('INSERT INTO cfg SET ?', dummyCfg, function(err, result) {
                        if (err) {
                            logging.Trace(query.sql);
                            f(false);
                        }
                        else {
                            var empName = 'EMPL-DEF';
                            var queryInsertSite = connection.query('INSERT INTO emplazamiento SET cfg_idCFG=?,name=?', [result.insertId, empName], function(err, resultSite) {
                                if (err) {
                                    logging.Trace(query.sql);
                                    f(false);
                                }
                                else {
									/*var idEmpla=result.insertId;
									var query = connection.query('INSERT INTO CGW SET servicio=?,EMPLAZAMIENTO_idEMPLAZAMIENTO=?,name=?,dualidad=?,ipv=?,ips=?,nivelconsola=?,puertoconsola=?,nivelIncidencias=?',
									[servicioId,gtw.EMPLAZAMIENTO_idEMPLAZAMIENTO,gtw.name,gtw.dualidad,ip,gtw.ips,gtw.nivelconsola,gtw.puertoconsola,gtw.nivelIncidencias], function(err, result) {
										if (err) {
											logging.Error("SQL: " + query.sql + "\nERROR: " + err.message);
										}
										else {
											var seguimos = 1;
										}
									});*/
                                }
                            });
                        }
                    });
                }
            });
        }
    });
}

///****************************************/
///*	FUNCTION: getGatewaysIp4ChangeSite 	*/
///*  PARAMS: ipb1						*/
///*  PARAMS: ipb2						*/
///*  PARAMS: idEmp						*/
///*  									*/
///*  REV 1.0.2 VMG						*/
///****************************************/
exports.getGatewaysIp4ChangeSite = function(ipb1, ipb2, idEmp, f) {
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
            var query = connection.query('SELECT ip_cpu0 as ipb ' +
                'FROM pasarelas p ' +
                'WHERE p.emplazamiento_id=? ' +
                'UNION ' +
                'SELECT ip_cpu1 as ipb ' +
                'FROM pasarelas p ' +
                'WHERE p.emplazamiento_id=?', [idEmp, idEmp],
                function(err, rows, fields) {
                    logging.Trace(query.sql);
                    connection.end();
                    if (err) {
                        f({ error: err, data: null });
                    }
                    else if (rows == null) {
                        f({ error: err, data: null });
                    }
                    else {
                        var dupIp1 = false;
                        var dupIp2 = false;
                        for (var i = 0; i < rows.length; i++) {
                            if (ipb1 == rows[i].ipb) {
                                dupIp1 = true;
                                break;
                            }
                            if (ipb2 == rows[i].ipb) {
                                dupIp2 = true;
                                break;
                            }
                        }
                        if (dupIp1)
                            f({ error: "IP_DUP_1", data: rows });
                        else if (dupIp2)
                            f({ error: "IP_DUP_2", data: rows });
                        else
                            f({ error: "NO_ERROR", data: rows });
                    }
                });
        }
    });
};

///****************************/
///*	FUNCTION: getGateways 	*/
///*  PARAMS: 				*/
///*  REV 1.0.2 VMG			*/
///****************************/
exports.getGateways = function getGateways(req, res, cfg, gtw) {
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
            var query = connection.query('SELECT p.idpasarela as idCGW,e.nombre as nameSite, ' +
                'p.nombre as name, 1 as Viva,1 as Activa ' +
                'FROM pasarelas p ' +
                'LEFT JOIN emplazamientos e ON e.idemplazamiento=p.emplazamiento_id ' +
                'LEFT JOIN configuraciones c ON c.idconfiguracion=e.configuracion_id ' +
                'WHERE c.idconfiguracion=?', [cfg],
                function(err, rows) {
                    logging.Trace(query.sql);
                    connection.end();
                    if (err)
                        res.json({ general: null, error: err.message });
                    else {
                        res.json({ general: rows, error: null });
                    }
                });
        }
    });
};

/*var query = "";
if (cfg == null || cfg == 'null'){
    query=connection.query('SELECT c.*,cc.Activa,DATE_FORMAT(cc.LastUpdate, "%d/%m/%Y %H:%i:%s") as LastUpdate, cc.Sincro, cc.CFG_idCFG, ce.Viva, e.name as nameSite FROM cgw c ' +
                            'INNER JOIN emplazamiento e ON c.EMPLAZAMIENTO_idEMPLAZAMIENTO=e.idEMPLAZAMIENTO ' +
                            'LEFT JOIN cgw_cfg cc ON c.idCGW=cc.CGW_idCGW ' + 
                            'LEFT JOIN cgw_estado ce ON c.idCGW=ce.cgw_idCGW ' +
                            'ORDER BY c.name,-cc.Activa', function(err, rows, fields) {
        logging.Trace(query.sql);

        if (rows != null && rows.length > 0){
            var names=[]
            async.each(rows,
                function(r,callback){
                    var index = names.indexOf(r.idCGW);
                    if (index == -1){
                        gtws.push(r)
                        names.push(r.idCGW);
                        callback();
                    }
                    else{
                        gtws[index].Activa = gtws[index].Activa == 1 ? 1 : r.Activa;
                        callback();
                    }
                },
                function(err){
                    res.json({general: gtws})
                }
            );
        }
        else
            res.json({general:null})
    });
}
else{
    if (gtw == null){
        query=connection.query('SELECT a.*, b.Activa, b.Sincro, ce.Viva, e.name as nameSite, c.idCFG,c.name as nameCfg, c.description, c.activa, c.ts_activa FROM CGW a ' +
                                'INNER JOIN emplazamiento e ON a.EMPLAZAMIENTO_idEMPLAZAMIENTO=e.idEMPLAZAMIENTO ' +
                                'INNER JOIN cfg c ON c.idCFG=e.CFG_idCFG ' +
                                'LEFT JOIN CGW_CFG b ON a.idCGW = b.CGW_idCGW ' +
                                'LEFT JOIN cgw_estado ce ON a.idCGW=ce.cgw_idCGW ' +
                                'WHERE c.idCFG=? ORDER BY e.name, a.name', cfg, function(err, rows, fields) {
            logging.Trace(query.sql);

            if (rows.length > 0){
                gtws = rows;
                logging.Trace(JSON.stringify({general: gtws},null,'\t'));
            }

            res.json({general: gtws})
        });
    }
}

connection.end();	
}
});
};*/

///****************************/
///*	FUNCTION: postGateway 	*/
///*  PARAMS: newGateway		*/
///****************************/
exports.postGateway = function postGateway(idConf, assignToCfg, ignoreName, newGateway, service, f) {
    var mySql = require('mySql');
    var connection = ug5kdb.GetDbConnection();/* mySql.createConnection({
        host: gcfg.Ulises.dbhost,
        user: gcfg.Ulises.dbuser,
        password: gcfg.Ulises.dbpassword,
        database: gcfg.Ulises.dbdatabase
    });*/

    logging.Error('(gateways).postGateway');
    connection.connect(function(err) {
        if (err) {
            return logging.Error("Error connection to 'U5K-G' database.");
        }
        else {
            /// Comprobar que el nombre o la dirección IP de la pasarela no exista
            var querySelect = connection.query('SELECT name FROM cgw WHERE name=?', [newGateway.name], function(err, rows) {
                if (!ignoreName && (err != null || rows.length != 0)) {
                    connection.end();
                    return f({ error: 'ER_DUP_ENTRY' });
                }
                else {
                    var idConfig;
                    async.waterfall([
                        // Update SERVICIO (including SIP, SNMP, WEB, GRAB and SINCR components)
                        function(callback) {
                            if (service.idSERVICIOS != null) {
                                servicesLib.getServices(null, service.idSERVICIOS, function(result) {
                                    if (result.services != null) {
                                        servicesLib.updateServices(connection, service, function(err) {
                                            if (err) return callback(err);
                                            callback(null, service.idSERVICIOS);
                                        });
                                    }
                                    else {
                                        servicesLib.insertServices(connection, service, function(err, serviceId) {
                                            if (err) return callback(err);
                                            callback(null, serviceId);
                                        });
                                    }
                                });
                            }
                            else {
                                callback(null, '0');
                            }
                        },
                        // Insert CGW
                        function(servicioId, callback) {
                            // Saber si la pasarela que se está dando de alta
                            // pertenece a la configuracion activa
                            var isInActiveCfg = false;
                            // Crear copia del objeto newGateway
                            var gtw = JSON.parse(JSON.stringify(newGateway));
                            // Eliminar del JSON gtw la parte de CPU.
                            delete gtw.cpus;
                            delete gtw.idCGW;

                            // Localizar el emplazamiento
                            getEmplazamiento(gtw.emplazamiento, idConf, function(result) {
                                if (result.error === null) {
                                    gtw.EMPLAZAMIENTO_idEMPLAZAMIENTO = result.data.idEMPLAZAMIENTO;
                                    idConfig = result.data.idCFG;
                                    isInActiveCfg = result.data.Activa;

                                    delete gtw.emplazamiento;

                                    if (servicioId != null) {
                                        // Puede ser, sobre to-do con el paso de la versión Beta5 a Beta6,
                                        // que exista la pasarela pero no su correspondiente registro en CGW_FISICA
                                        // en cuyo caso, hay que eliminar la pasarela con los datos existentes
                                        // y así evitar que aparezcan pasarelas duplicadas
                                        // var qDelete = connection.query('DELETE FROM CGW WHERE name=?',gtw.name,function(err,result){
                                        // 	if (err){
                                        // 		logging.Error("SQL: " + qDelete.sql + "\nERROR: " + err.message);
                                        // 		return callback(null, {error: err, data: newGateway});
                                        // 	}

                                        var query = connection.query('INSERT INTO CGW SET servicio=?,EMPLAZAMIENTO_idEMPLAZAMIENTO=?,name=?,dualidad=?,ipv=?,ips=?,nivelconsola=?,puertoconsola=?,nivelIncidencias=?',
                                            [servicioId, gtw.EMPLAZAMIENTO_idEMPLAZAMIENTO, gtw.name, gtw.dualidad, gtw.ipv, gtw.ips, gtw.nivelconsola, gtw.puertoconsola, gtw.nivelIncidencias], function(err, result) {
                                                if (err) {
                                                    logging.Error("SQL: " + query.sql + "\nERROR: " + err.message);
                                                    return callback(null, { error: err, data: newGateway });
                                                }
                                                newGateway.idCGW = result.insertId;

                                                logging.Trace(query.sql);
                                                var idCGW = { 'CGW_idCGW': result.insertId };

                                                var queryCgw_estado = connection.query('INSERT INTO cgw_estado SET cgw_idCGW = ?,cgw_EMPLAZAMIENTO_idEMPLAZAMIENTO=?,viva=0',
                                                    [newGateway.idCGW, gtw.EMPLAZAMIENTO_idEMPLAZAMIENTO], function(err, result) {
                                                        logging.Trace(queryCgw_estado.sql);
                                                        if (err) {
                                                            callback(err);
                                                            //connection.end();
                                                            //return f({error: err.code, data: trgt});
                                                        }

                                                        // Asignar a la configuración (cgw_cfg.Activa = 0).
                                                        if (assignToCfg == true) {
                                                            exports.assignGatewayToConfiguration({ "CFG_idCFG": idConfig, "CGW_idCGW": newGateway.idCGW, "Activa": isInActiveCfg }, function(result) {
                                                                callback(null, idCGW);
                                                            });
                                                        }
                                                        else
                                                            callback(null, idCGW);
                                                    });
                                                /*
                                                var queryCgwFisica = connection.query('REPLACE INTO CGW_FISICA SET ip=?',
                                                    [req.params.gateway], function(err, result) {
                                                    if (err){
                                                        logging.Error("SQL: " + queryCgwFisica.sql + "\nERROR: " + err.message);
                                                        return callback(null, {error: err, data: newGateway});
                                                    }
    
                                                    callback(null,idCGW);
                                                })*/
                                            });
                                    }
                                    else {
                                        // Puede ser, sobre to-do con el paso de la versión Beta5 a Beta6,
                                        // que exista la pasarela pero no su correspondiente registro en CGW_FISICA
                                        // en cuyo caso, hay que eliminar la pasarela con los datos existentes
                                        // y así evitar que aparezcan pasarelas duplicadas
                                        // var qDelete = connection.query('DELETE FROM CGW WHERE name=?',gtw.name,function(err,result){
                                        // 	if (err){
                                        // 		logging.Error("SQL: " + qDelete.sql + "\nERROR: " + err.message);
                                        // 		return callback(null, {error: err, data: newGateway});
                                        // 	}
                                        /*var*/ query = connection.query('INSERT INTO CGW SET EMPLAZAMIENTO_idEMPLAZAMIENTO=?,name=?,dualidad=?,ipv=?,ips=?,nivelconsola=?,puertoconsola=?,nivelIncidencias=?', [gtw.EMPLAZAMIENTO_idEMPLAZAMIENTO, gtw.name, gtw.dualidad, gtw.ipv, gtw.ips, gtw.nivelconsola, gtw.puertoconsola, gtw.nivelIncidencias], function(err, result) {
                                            if (err) {
                                                return callback(null, { error: err, data: newGateway });
                                            }
                                            newGateway.idCGW = result.insertId;

                                            logging.Trace(query.sql);
                                            var idCGW = { 'CGW_idCGW': result.insertId };

                                            var queryCgw_estado = connection.query('INSERT INTO cgw_estado SET cgw_idCGW = ?,cgw_EMPLAZAMIENTO_idEMPLAZAMIENTO=?,viva=0',
                                                [newGateway.idCGW, gtw.EMPLAZAMIENTO_idEMPLAZAMIENTO], function(err, result) {
                                                    logging.Trace(queryCgw_estado.sql);
                                                    if (err) {
                                                        callback(err);
                                                        //	connection.end();
                                                        //	return f({error: err.code, data: trgt});
                                                    }

                                                    if (assignToCfg == true) {
                                                        exports.assignGatewayToConfiguration({ "CFG_idCFG": idConfig, "CGW_idCGW": newGateway.idCGW, "Activa": isInActiveCfg }, function(result) {
                                                            callback(null, idCGW);
                                                        });
                                                    }
                                                    else
                                                        callback(null, idCGW);
                                                });
                                            /*
                                            var queryCgwFisica = connection.query('REPLACE INTO CGW_FISICA SET ip=?',
                                                [req.params.gateway], function(err, result) {
                                                if (err){
                                                    return callback(null, {error: err, data: newGateway});
                                                }

                                                callback(null,idCGW);
                                            })*/
                                        });
                                        //});
                                    }
                                }
                                else {
                                    connection.end();
                                    return f({ error: 'ER_DUP_ENTRY' });
                                }
                            });
                        },
                        // Insert CPUs
                        function(idCgw, callback) {
                            async.waterfall([
                                // Insert CPU-1
                                function(callback) {
                                    newGateway.cpus[0].num = 1;
                                    var query = connection.query('INSERT INTO CPU SET ?,?', [idCgw, newGateway.cpus[0]], function(err, resul) {
                                        if (err) {
                                            return callback(err);
                                        }

                                        logging.Trace(query.sql);
                                        callback(null);
                                    });
                                },
                                // Insert CPU-2
                                function(callback) {
                                    if (newGateway.cpus.length == 2) {
                                        newGateway.cpus[1].num = 2;
                                        var query = connection.query('INSERT INTO CPU SET ?,?', [idCgw, newGateway.cpus[1]], function(err, resul) {
                                            if (err) {
                                                return callback(err);
                                            }

                                            logging.Trace(query.sql);
                                            callback(null);
                                        });
                                    }
                                    else
                                        callback(null);
                                },
                                // Insert slaves
                                function(callback) {
                                    var gtw = JSON.parse(JSON.stringify(newGateway));

                                    var i = 0;
                                    async.whilst(
                                        function() { return i < 4; },
                                        function(callback) {
                                            var nameSlave = gtw.name + '_' + i++;
                                            ///	Copiar slaves
                                            var querySlaves = connection.query('INSERT INTO slaves (name,tp) VALUES (?,0)', nameSlave, function(err, resultSlaves) {
                                                logging.Trace(querySlaves.sql);

                                                /// Copiar hardware
                                                var queryHw = connection.query('INSERT INTO hardware (CGW_idCGW,SLAVES_idSLAVES,rank) VALUES (?,?,?)', [newGateway.idCGW, resultSlaves.insertId, i - 1], function(err, resultHw) {
                                                    logging.Trace(queryHw.sql);

                                                    callback();
                                                });
                                            });
                                        },
                                        function(err) {
                                            callback();
                                        }
                                    );
                                }
                            ], callback);
                        }
                    ], function(err) {
                        connection.end();

                        if (err) {
                            logging.Trace('Error in asynchronous POST. ' + err.message);
                            return f({ error: err, data: newGateway });
                        }

                        f({ error: null, data: newGateway, idCfg: idConfig });
                    });
                }
            });
        }
    });
};

///****************************/
///*	FUNCTION: getGateway 	*/
///*  PARAMS: req,			*/
///*			res,			*/
///*			id cfg			*/
///*			ip gtw			*/
///*  REV 1.0.2 VMG			*/
///****************************/
exports.getGateway = function getGateway(req, res, cfg, gtw, f) {
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
        else {

            var query = "";
            if (cfg == null) { //Venimos de ver la gtw al pulsar sobre ella
                query = connection.query('SELECT p.idpasarela as idCGW, p.emplazamiento_id as EMPLAZAMIENTO_idEMPLAZAMIENTO,  ' +
                    'p.nombre as name, e.nombre as emplazamiento, p.ip_virtual as ipv, ' +
                    'p.ultima_actualizacion, p.ip_cpu0, p.ip_gtw0, p.mask_cpu0, p.ip_cpu1, p.ip_gtw1, p.mask_cpu1, ' +
                    'p.puerto_sip, p.periodo_supervision, p.puerto_servicio_snmp, p.puerto_snmp, ' +
                    'p.snmpv2, p.comunidad_snmp, p.nombre_snmp, p.localizacion_snmp, contacto_snmp, p.puerto_servicio_web, ' +
                    'p.tiempo_sesion, p.puerto_rtsp, p.servidor_rtsp, p.servidor_rtspb, ' +
                    'p.sppe, p.dvrrp ' +
                    'FROM pasarelas p ' +
                    'LEFT JOIN emplazamientos e ON p.emplazamiento_id = e.idemplazamiento ' +
                    'WHERE idpasarela=?', gtw, function(err, rows, fields) {
                        logging.Trace(query.sql);
                        connection.end();
                        if (err)
                            res.json({ error: err.message });
                        else {
                            //var defaultConfig=config.Ulises.JsonData;
                            var templateConfig = jsonTemplate.fillTemplate();

                            templateConfig.general.emplazamiento = rows[0].emplazamiento;
                            templateConfig.general.ipv = rows[0].ipv;
                            templateConfig.general.name = rows[0].name;

                            logging.Trace(JSON.stringify({ result: rows }, null, '\t'));
                            res.json({ result: rows });
                        }
                    });
            }//TODO esta parte muy probablemente hay que quitar... Ahora solo vamos a llamar desde la de arriba no desde servicios
            else {//Venimos desde GetServices
                query = connection.query('SELECT a.*,b.tlan,b.ip0,b.ms0,b.ip1,b.ms1,b.ipb,b.msb,b.ipg ' +
                    'FROM CGW a INNER JOIN CPU b ON a.idCGW = b.CGW_idCGW ' +
                    'WHERE a.idCGW=? AND a.idCGW in (SELECT CGW_idCGW FROM cgw_cfg where CFG_idCFG=?)', [gtw, cfg], function(err, rows, fields) {
                        logging.Trace(query.sql);
                        connection.end();
                        if (err) throw err;
                        if (rows.length > 0) {
                            var gtw = {};
                            gtw = { 'name': rows[0].name, 'dualidad': rows[0].dualidad, 'ipv': rows[0].ipv };
                            var cpus = [];
                            for (var r in rows) {
                                cpus.push({ 'tlan': rows[r].tlan, 'ip0': rows[r].ip0, 'ms0': rows[r].ms0, 'ip1': rows[r].ip1, 'ms1': rows[r].ms1, 'ipb': rows[r].ipb, 'msb': rows[r].msb, 'ipg': rows[r].ipg });
                            }
                            gtw['cpus'] = cpus;
                            logging.Trace(JSON.stringify({ general: gtw }, null, '\t'));
                            f(gtw);
                        }
                        else
                            res.status(202).json("Gateway not found.");
                    });
            }
        }
    });
};

///********************************************************/
///*	FUNCTION: getSiteName4ServiceCopy 					*/
///*	DESCRIPTION: Get id, cfg name and cgw name		 	*/
///*  PARAMS: f: callback function 						*/
///*														*/
///*  REV 1.0.2 VMG										*/
///********************************************************/
exports.getSiteName4ServiceCopy = function getSiteName4ServiceCopy(f) {
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
        else {
            var query = "";
            query = connection.query('SELECT p.idpasarela, CONCAT(c.nombre,"-",p.nombre) as nombre ' +
                'FROM pasarelas p ' +
                'LEFT JOIN emplazamientos e ON p.emplazamiento_id=e.idemplazamiento ' +
                'LEFT JOIN configuraciones c ON e.configuracion_id=c.idconfiguracion',
                function(err, rows) {
                    connection.end();
                    logging.Trace(query.sql);
                    if (err)
                        f(err.message);
                    else {
                        f({ result: rows });
                    }
                });
        }
    });
};

///********************************************************/
///*	FUNCTION: getServiceDataFromGtw 					*/
///*	DESCRIPTION: Get id, cfg name and cgw name		 	*/
///*  PARAMS: idSourceGtw: id of the source gtw			*/
///*			f: callback function 						*/
///*														*/
///*  REV 1.0.2 VMG										*/
///********************************************************/
exports.getServiceDataFromGtw = function getServiceDataFromGtw(idSourceGtw, f) {
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
        else {
            var query = "";
            query = connection.query('SELECT * ' +
                'FROM pasarelas p ' +
                'WHERE p.idpasarela=?', idSourceGtw,
                function(err, rows) {
                    connection.end();
                    logging.Trace(query.sql);
                    if (err)
                        f(err.message);
                    else {
                        f({ result: rows });
                    }
                });
        }
    });
};

///********************************************************/
///*	FUNCTION: getServiceDataListaIpsFromGtw 			*/
///*	DESCRIPTION: Get id, cfg name and cgw name		 	*/
///*  PARAMS: idSourceGtw: id of the source gtw			*/
///*			f: callback function 						*/
///*														*/
///*  REV 1.0.2 VMG										*/
///********************************************************/
exports.getServiceDataListaIpsFromGtw = function getServiceDataListaIpsFromGtw(idSourceGtw, f) {
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
        else {
            var query = "";
            query = connection.query('SELECT * ' +
                'FROM lista_ips li ' +
                'WHERE li.pasarela_id=?', idSourceGtw,
                function(err, rows) {
                    connection.end();
                    logging.Trace(query.sql);
                    if (err)
                        f(err.message);
                    else {
                        f({ result: rows });
                    }
                });
        }
    });
};

///********************************************************/
///*	FUNCTION: getIpList4Gateway 						*/
///*	DESCRIPTION: Get gateway ip list associated		 	*/
///*  PARAMS: gtw: gatewayIp 								*/
///*			f: callback function 						*/
///*  REV 1.0.2 VMG										*/
///********************************************************/
exports.getIpList4Gateway = function getIpList4Gateway(gtw, f) {
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
        else {
            var query = "";
            query = connection.query(
                'SELECT * FROM lista_ips WHERE pasarela_id = ?', gtw,
                function(err, rows) {
                    connection.end();
                    logging.Trace(query.sql);
                    if (err)
                        f(err.message);
                    else {
                        f(rows);
                    }
                });
        }
    });
};

///********************************************************/
///*	FUNCTION: delGateway 								*/
///*	DESCRIPTION: Delete gateway (all items associated	*/
///*		on cascade will be deleted too)					*/
///*  PARAMS: gtw: gatewayId 								*/
///*			res: result			 						*/
///*  REV 1.0.2 VMG										*/
///********************************************************/
exports.delGateway = function delGateway(req, res, gtw) {
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
        else {
            var querySel = connection.query('DELETE FROM pasarelas WHERE idpasarela=? ', gtw,
                function(err, result) {
                    logging.Trace(querySel.sql);
                    connection.end();
                    if (err)
                        res.json({ error: err.message });
                    else
                        res.json({ data: result });
                });
        }
    });
};

///********************************************************/
///*	FUNCTION: getRadioRes4Gateway 						*/
///*	DESCRIPTION: Delete gateway (all items associated	*/
///*		on cascade will be deleted too)					*/
///*  PARAMS: gtw: gatewayId 								*/
///*			res: result			 						*/
///*  REV 1.0.2 VMG										*/
///********************************************************/
exports.getRadioRes4Gateway = function getRadioRes4Gateway(resourceId, f) {
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
        else {
            var querySel = connection.query('SELECT rr.idrecurso_radio,rr.nombre,rr.codec,rr.clave_registro,rr.frecuencia,rr.ajuste_ad,' +
                'rr.ajuste_da,rr.precision_audio,rr.tipo_agente,rr.indicacion_entrada_audio,rr.indicacion_salida_audio,' +
                'rr.metodo_bss,rr.retraso_interno_grs,rr.tabla_bss_id,rr.tabla_bss_id,rr.evento_ptt_squelch,rr.habilita_grabacion,' +
                'rr.umbral_vad,rr.prioridad_ptt,rr.prioridad_sesion_sip,rr.climax_bss,rr.ventana_bss,rr.cola_bss_sqh,rr.tipo_climax,' +
                'rr.metodo_climax,rr.restriccion_entrantes,retardo_fijo_climax ' +
                'FROM recursos_radio rr ' +
                'WHERE idrecurso_radio=? ', resourceId,
                function(err, result) {
                    logging.Trace(querySel.sql);
                    connection.end();
                    if (err)
                        return f({ error: err.message });
                    else
                        return f(result[0]);
                });
        }
    });
};

///********************************************************/
///*	FUNCTION: delGateway 								*/
///*	DESCRIPTION: Delete gateway (all items associated	*/
///*		on cascade will be deleted too)					*/
///*  PARAMS: gtw: gatewayId 								*/
///*			res: result			 						*/
///*  REV 1.0.2 VMG										*/
///********************************************************/
exports.getTfnoRes4Gateway = function getTfnoRes4Gateway(resourceId, f) {
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
        else {
            var querySel = connection.query('SELECT rt.idrecurso_telefono,rt.nombre,rt.codec,rt.clave_registro,rt.precision_audio,' +
                'rt.ajuste_ad,rt.ajuste_da,rt.tipo_interfaz_tel,rt.uri_telefonica,rt.deteccion_vox,rt.umbral_vox,' +
                'rt.cola_vox,rt.respuesta_automatica,rt.periodo_tonos,rt.lado,rt.origen_test,rt.destino_test,' +
                'rt.supervisa_colateral,rt.tiempo_supervision,rt.duracion_tono_interrup, rt.ats_user, rt.det_inversion_pol as DetInversionPol ' +
                'FROM recursos_telefono rt ' +
                'WHERE idrecurso_telefono=? ', resourceId,
                function(err, result) {
                    logging.Trace(querySel.sql);
                    connection.end();
                    if (err)
                        return f({ error: err.message });
                    else
                        return f(result[0]);
                });
        }
    });
};

///********************************************************/
///*	FUNCTION: insertRadioRes4Gateway 					*/
///*	DESCRIPTION: Insert radio resource data				*/
///*  PARAMS: rr: radioResource 			 				*/
///*			f: result			 						*/
///*  REV 1.0.2 VMG										*/
///********************************************************/
exports.insertRadioRes4Gateway = function insertRadioRes4Gateway(rr, f) {
    var mySql = require('mySql');
    var connection = ug5kdb.GetDbConnection();/* mySql.createConnection({
        host: gcfg.Ulises.dbhost,
        user: gcfg.Ulises.dbuser,
        password: gcfg.Ulises.dbpassword,
        database: gcfg.Ulises.dbdatabase,
        multipleStatements: true
    });*/
    var insertedResource = '';
    var activa = 0;
    connection.connect(function(err) {
        if (err) {
            logging.Error("Error connention to 'U5K-G' database.");
            return;
        }
        else {
            var selQuery = connection.query('SELECT c.activa ' +
                'FROM pasarelas p ' +
                'LEFT JOIN emplazamientos e ON p.emplazamiento_id=e.idemplazamiento ' +
                'LEFT JOIN configuraciones c ON e.configuracion_id=c.idconfiguracion ' +
                'WHERE p.idpasarela=?', [rr.pasarela_id],
                function(err, rows) {
                    if (err) {
                        connection.end();
                        return f({ error: err.message });
                    }
                    else {
                        activa = rows[0].activa;
                        var querySel = connection.query('INSERT INTO recursos_radio (pasarela_id,fila,columna,nombre,codec,' +
                            'clave_registro,frecuencia,ajuste_ad,ajuste_da,precision_audio,tipo_agente,indicacion_entrada_audio,' +
                            'indicacion_salida_audio,umbral_vad,metodo_bss,evento_ptt_squelch,prioridad_ptt,prioridad_sesion_sip,' +
                            'climax_bss,tabla_bss_id,retraso_interno_grs,habilita_grabacion,restriccion_entrantes,retardo_fijo_climax,' +
                            'ventana_bss,tipo_climax,metodo_climax) ' +
                            'VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
                            [rr.pasarela_id, rr.fila, rr.columna, rr.nombre, rr.codec, rr.clave_registro, rr.frecuencia, rr.ajuste_ad, rr.ajuste_da,
                            rr.precision_audio, rr.tipo_agente, rr.indicacion_entrada_audio, rr.indicacion_salida_audio, rr.umbral_vad,
                            rr.metodo_bss, rr.evento_ptt_squelch, rr.prioridad_ptt, rr.prioridad_sesion_sip, rr.climax_bss, rr.tabla_bss_id,
                            rr.retraso_interno_grs, rr.habilita_grabacion, rr.restriccion_entrantes, rr.retardo_fijo_climax, rr.ventana_bss,
                            rr.tipo_climax, rr.metodo_climax],
                            function(err, result) {
                                logging.Trace(querySel.sql);
                                //connection.end();
                                if (err) {
                                    connection.end();
                                    return f({ error: err.message });
                                }
                                else {
                                    insertedResource = result.insertId;
                                    var query = connection.query('UPDATE pasarelas p ' +
                                        'SET p.pendiente_actualizar=1 ' +
                                        'WHERE p.idpasarela=?', [rr.pasarela_id],
                                        function(err, result) {
                                            logging.Trace(query.sql);
                                            if (err) {
                                                connection.end();
                                                return f({ error: err.message });
                                            }
                                            else {
                                                if (rr.listaUris.length > 0) {
                                                    var queries = '';
                                                    rr.listaUris.forEach(function(item) {
                                                        queries += mySql.format('INSERT INTO lista_uris (recurso_radio_id,uri,tipo,nivel_colateral) ' +
                                                            'VALUES (?,?,?,?); ', [insertedResource, item.uri, item.tipo, item.nivel_colateral]);
                                                    });
                                                    connection.query(queries, function(err, results) {
                                                        connection.end();
                                                        if (err) {
                                                            return f({ error: err.message });
                                                        }
                                                        else
                                                            return f({ result: 'OK', error: null, activa: activa });
                                                    });
                                                }
                                                else {//No se inserta ninguna ip
                                                    connection.end();
                                                    return f({ result: 'OK', error: null, activa: activa });
                                                }
                                            }
                                        });
                                }
                            });
                    }
                });
        }
    });
};

///********************************************************/
///*	FUNCTION: insertTfnoRes4Gateway 					*/
///*	DESCRIPTION: Insert telephone resource data			*/
///*  PARAMS: tr: telephoneResource 			 			*/
///*			f: result			 						*/
///*  REV 1.0.2 VMG										*/
///********************************************************/
exports.insertTfnoRes4Gateway = function insertTfnoRes4Gateway(tr, f) {
    var mySql = require('mySql');
    var connection = ug5kdb.GetDbConnection();/* mySql.createConnection({
        host: gcfg.Ulises.dbhost,
        user: gcfg.Ulises.dbuser,
        password: gcfg.Ulises.dbpassword,
        database: gcfg.Ulises.dbdatabase,
        multipleStatements: true
    });*/
    var insertedResource = '';
    var activa = 0;
    connection.connect(function(err) {
        if (err) {
            logging.Error("Error connention to 'U5K-G' database.");
            return;
        }
        else {
            var selQuery = connection.query('SELECT c.activa ' +
                'FROM pasarelas p ' +
                'LEFT JOIN emplazamientos e ON p.emplazamiento_id=e.idemplazamiento ' +
                'LEFT JOIN configuraciones c ON e.configuracion_id=c.idconfiguracion ' +
                'WHERE p.idpasarela=?', [tr.pasarela_id],
                function(err, rows) {
                    if (err) {
                        connection.end();
                        return f({ error: err.message });
                    }
                    else {
                        activa = rows[0].activa;
                        var querySel = connection.query('INSERT INTO recursos_telefono (pasarela_id,fila,columna,nombre,' +
                            'codec,clave_registro,ajuste_ad,ajuste_da,tipo_interfaz_tel,uri_telefonica,deteccion_vox,umbral_vox,' +
                            'cola_vox,respuesta_automatica,periodo_tonos,lado,origen_test,destino_test,supervisa_colateral,' +
                            'tiempo_supervision,duracion_tono_interrup, ats_user, det_inversion_pol) ' +
                            'VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
                            [tr.pasarela_id, tr.fila, tr.columna, tr.nombre, tr.codec, tr.clave_registro, tr.ajuste_ad, tr.ajuste_da,
                            tr.tipo_interfaz_tel, tr.uri_telefonica, tr.deteccion_vox, tr.umbral_vox, tr.cola_vox, tr.respuesta_automatica,
                            tr.periodo_tonos, tr.lado, tr.origen_test, tr.destino_test, tr.supervisa_colateral, tr.tiempo_supervision,
                            tr.duracion_tono_interrup, tr.ats_user, tr.DetInversionPol],
                            function(err, result) {
                                logging.Trace(querySel.sql);
                                if (err == null) {
                                    insertedResource = result.insertId;
                                    var query = connection.query('UPDATE pasarelas p ' +
                                        'SET p.pendiente_actualizar=1 ' +
                                        'WHERE p.idpasarela=?', [tr.pasarela_id],
                                        function(err, result) {
                                            logging.Trace(query.sql);
                                            if (err) {
                                                connection.end();
                                                return f({ error: err.message });
                                            }
                                            else {
                                                if (tr.ranks.length > 0) {
                                                    var queries = '';
                                                    tr.ranks.forEach(function(item) {
                                                        queries += mySql.format('INSERT INTO rangos_ats (recurso_telefonico_id,' +
                                                            'rango_ats_inicial,rango_ats_final,tipo) VALUES (?,?,?,?);',
                                                            [insertedResource, item.inicial, item.final, item.tipo]);
                                                    });
                                                    connection.query(queries, function(err, results) {
                                                        connection.end();
                                                        if (err) {
                                                            return f({ error: err.message });
                                                        }
                                                        else
                                                            return f({ result: 'OK', error: null, activa: activa });
                                                    });
                                                }
                                                else {//No se inserta ningun rango ats
                                                    connection.end();
                                                    return f({ result: 'OK', error: null, activa: activa });
                                                }
                                            }
                                        });
                                }
                                else {
                                    connection.end();
                                    return f({ error: err.message });
                                }

                            });
                    }
                });
        }
    });
};

///********************************************************/
///*	FUNCTION: updateTfnoRes4Gateway 					*/
///*	DESCRIPTION: Update telephone resource data			*/
///*  PARAMS: tr: telephoneResource 			 			*/
///*			resId: resourceId 2 update					*/
///*			f: result			 						*/
///*  REV 1.0.2 VMG										*/
///********************************************************/
exports.updateTfnoRes4Gateway = function updateTfnoRes4Gateway(tr, resId, f) {
    var mySql = require('mySql');
    var connection = ug5kdb.GetDbConnection();/* mySql.createConnection({
        host: gcfg.Ulises.dbhost,
        user: gcfg.Ulises.dbuser,
        password: gcfg.Ulises.dbpassword,
        database: gcfg.Ulises.dbdatabase,
        multipleStatements: true
    });*/
    var activa = 0;
    connection.connect(function(err) {
        if (err) {
            logging.Error("Error connention to 'U5K-G' database.");
            return;
        }
        else {
            var selQuery = connection.query('SELECT c.activa ' +
                'FROM pasarelas p ' +
                'LEFT JOIN emplazamientos e ON p.emplazamiento_id=e.idemplazamiento ' +
                'LEFT JOIN configuraciones c ON e.configuracion_id=c.idconfiguracion ' +
                'WHERE p.idpasarela=?', [tr.pasarela_id],
                function(err, rows) {
                    if (err) {
                        connection.end();
                        return f({ error: err.message });
                    }
                    else {
                        activa = rows[0].activa;
                        var query = connection.query('UPDATE recursos_telefono SET nombre=?,clave_registro=?,ajuste_ad=?,ajuste_da=?,' +
                            'tipo_interfaz_tel=?,uri_telefonica=?,deteccion_vox=?,umbral_vox=?,cola_vox=?,respuesta_automatica=?,' +
                            'periodo_tonos=?,lado=?,origen_test=?,destino_test=?,supervisa_colateral=?,tiempo_supervision=?,' +
                            'duracion_tono_interrup=?, ' +
                            'ats_user=?, ' + 'det_inversion_pol=? ' +
                            'WHERE idrecurso_telefono=?',
                            [tr.nombre, tr.clave_registro, tr.ajuste_ad, tr.ajuste_da, tr.tipo_interfaz_tel, tr.uri_telefonica,
                            tr.deteccion_vox, tr.umbral_vox, tr.cola_vox, tr.respuesta_automatica, tr.periodo_tonos, tr.lado,
                            tr.origen_test, tr.destino_test, tr.supervisa_colateral, tr.tiempo_supervision, tr.duracion_tono_interrup,
                            tr.ats_user, tr.DetInversionPol, resId],
                            function(err, result) {
                                logging.Trace(query.sql);
                                if (err == null) {
                                    var query2 = connection.query('UPDATE pasarelas p ' +
                                        'SET p.pendiente_actualizar=1 ' +
                                        'WHERE p.idpasarela=?', [tr.pasarela_id],
                                        function(err, result) {
                                            logging.Trace(query2.sql);
                                            if (err) {
                                                connection.end();
                                                return f({ error: err.message });
                                            }
                                            else {

                                                //Ya que son varios y la unica manera de distinguirlos es con el id
                                                // Los borramos todos y los volvemos a insertar.
                                                var delQuery = connection.query('DELETE FROM rangos_ats WHERE recurso_telefonico_id=?',
                                                    [resId],
                                                    function(err, result) {
                                                        if (tr.ranks.length > 0) {
                                                            logging.Trace(delQuery.sql);
                                                            if (err == null) {
                                                                if (tr.tipo_interfaz_tel == '3' || tr.tipo_interfaz_tel == '4') {
                                                                    var queries = '';
                                                                    tr.ranks.forEach(function (item) {
                                                                        queries += mySql.format('INSERT INTO rangos_ats (recurso_telefonico_id,' +
                                                                            'rango_ats_inicial,rango_ats_final,tipo) VALUES (?,?,?,?);',
                                                                            [resId, item.inicial, item.final, item.tipo]);
                                                                    });
                                                                    connection.query(queries,
                                                                        function (err, results) {
                                                                            connection.end();
                                                                            if (err) {
                                                                                return f({error: err.message});
                                                                            }
                                                                            else
                                                                                return f({
                                                                                    result: 'OK',
                                                                                    error: null,
                                                                                });
                                                                        });
                                                                }
                                                                else
                                                                    connection.end();
                                                                    return f({
                                                                        result: 'OK',
                                                                        error: null,
                                                                        activa: activa
                                                                    });
                                                            }
                                                            else {
                                                                connection.end();
                                                                return f({error: err.message});
                                                            }
                                                        }
                                                        else//No se inserta ningun rango ats
                                                            connection.end();
                                                            return f({ result: 'OK', error: null, activa: activa });
                                                                    });
                                            }
                                        });
                                }
                                else {
                                    connection.end();
                                    return f({ error: err.message });
                                }

                            });
                    }
                });
        }
    });
};

///********************************************************/
///*	FUNCTION: updateRadioRes4Gateway 					*/
///*	DESCRIPTION: Update radio resource data				*/
///*  PARAMS: rr: radioResource 			 				*/
///*			resId: resourceId 2 update					*/
///*			f: result			 						*/
///*  REV 1.0.2 VMG										*/
///********************************************************/
exports.updateRadioRes4Gateway = function updateRadioRes4Gateway(rr, resId, f) {
    var mySql = require('mySql');
    var connection = ug5kdb.GetDbConnection();/* mySql.createConnection({
        host: gcfg.Ulises.dbhost,
        user: gcfg.Ulises.dbuser,
        password: gcfg.Ulises.dbpassword,
        database: gcfg.Ulises.dbdatabase,
        multipleStatements: true
    });*/
    var activa = 0;
    connection.connect(function(err) {
        if (err) {
            logging.Error("Error connention to 'U5K-G' database.");
            return;
        }
        else {
            var selQuery = connection.query('SELECT c.activa ' +
                'FROM pasarelas p ' +
                'LEFT JOIN emplazamientos e ON p.emplazamiento_id=e.idemplazamiento ' +
                'LEFT JOIN configuraciones c ON e.configuracion_id=c.idconfiguracion ' +
                'WHERE p.idpasarela=?', [rr.pasarela_id],
                function(err, rows) {
                    if (err) {
                        connection.end();
                        return f({error: err.message});
                    }
                    else {
                        activa = rows[0].activa;
                        var query = connection.query('UPDATE recursos_radio SET nombre=?,clave_registro=?,frecuencia=?,ajuste_ad=?,' +
                            'ajuste_da=?,precision_audio=?,tipo_agente=?,indicacion_entrada_audio=?,umbral_vad=?,indicacion_salida_audio=?,' +
                            'metodo_bss=?,evento_ptt_squelch=?,prioridad_ptt=?,prioridad_sesion_sip=?,climax_bss=?,tabla_bss_id=?,' +
                            'retraso_interno_grs=?,habilita_grabacion=?,restriccion_entrantes=?,retardo_fijo_climax=?,ventana_bss=?,' +
                            'tipo_climax=?,metodo_climax=? ' +
                            'WHERE idrecurso_radio=?',
                            [rr.nombre, rr.clave_registro, rr.frecuencia, rr.ajuste_ad, rr.ajuste_da, rr.precision_audio, rr.tipo_agente,
                            rr.indicacion_entrada_audio, rr.umbral_vad, rr.indicacion_salida_audio, rr.metodo_bss, rr.evento_ptt_squelch,
                            rr.prioridad_ptt, rr.prioridad_sesion_sip, rr.climax_bss, rr.tabla_bss_id, rr.retraso_interno_grs,
                            rr.habilita_grabacion, rr.restriccion_entrantes, rr.retardo_fijo_climax, rr.ventana_bss, rr.tipo_climax,
                            rr.metodo_climax, resId],
                            function(err, result) {
                                logging.Trace(query.sql);
                                //connection.end();
                                if (err) {
                                    connection.end();
                                    return f({ error: err.message });
                                }
                                else {
                                    var query2 = connection.query('UPDATE pasarelas p ' +
                                        'SET p.pendiente_actualizar=1 ' +
                                        'WHERE p.idpasarela=?', [rr.pasarela_id],
                                        function(err, result) {
                                            logging.Trace(query.sql);
                                            if (err) {
                                                connection.end();
                                                return f({ error: err.message });
                                            }
                                            else {
                                                var query3 = connection.query('SELECT COUNT(*) as cuantos FROM lista_uris WHERE recurso_radio_id=?',
                                                    [resId],
                                                    function(err, result) {
                                                        logging.Trace(query3.sql);
                                                        if (result[0].cuantos > 0) {
                                                            //Primero vamos a borrar todas las uris asociadas a esta pasarela
                                                            var delQuery = connection.query('DELETE FROM lista_uris WHERE recurso_radio_id=?',
                                                                [resId],
                                                                function(err, result) {
                                                                    logging.Trace(delQuery.sql);
                                                                    if (err == null) {
                                                                        var queriesInsert = '';
                                                                        rr.listaUris.forEach(function(item) {
                                                                            queriesInsert += mySql.format('INSERT INTO lista_uris (recurso_radio_id,uri,tipo,nivel_colateral) ' +
                                                                                'VALUES (?,?,?,?); ', [resId, item.uri, item.tipo, item.nivel_colateral]);
                                                                        });
                                                                        connection.query(queriesInsert,
                                                                            function(err, results) {
                                                                                connection.end();
                                                                                if (err) {
                                                                                    if (err.code == "ER_EMPTY_QUERY")
                                                                                        return f({
                                                                                            result: 'OK',
                                                                                            error: null,
                                                                                            activa: activa
                                                                                        });
                                                                                    else
                                                                                        return f({ error: err.message });
                                                                                }
                                                                                else {
                                                                                    return f({
                                                                                        result: 'OK',
                                                                                        error: null,
                                                                                        activa: activa
                                                                                    });
                                                                                }
                                                                            });
                                                                    }
                                                                    else {
                                                                        connection.end();
                                                                        return f({ error: err.message });
                                                                    }

                                                                });
                                                        }
                                                        else {
                                                            if (rr.listaUris.length > 0) {
                                                                var queriesInsert = '';
                                                                rr.listaUris.forEach(function(item) {
                                                                    queriesInsert += mySql.format('INSERT INTO lista_uris (recurso_radio_id,uri,tipo,nivel_colateral) ' +
                                                                        'VALUES (?,?,?,?); ', [resId, item.uri, item.tipo, item.nivel_colateral]);
                                                                });
                                                                connection.query(queriesInsert,
                                                                    function(err, results) {
                                                                        connection.end();
                                                                        if (err) {
                                                                            if (err.code == "ER_EMPTY_QUERY")
                                                                                return f({
                                                                                    result: 'OK',
                                                                                    error: null,
                                                                                    activa: activa
                                                                                });
                                                                            else
                                                                                return f({ error: err.message });
                                                                        }
                                                                        else {
                                                                            return f({
                                                                                result: 'OK',
                                                                                error: null,
                                                                                activa: activa
                                                                            });
                                                                        }
                                                                    });
                                                            }
                                                            else {
                                                                connection.end();
                                                                return f({ result: 'OK', error: null, activa: activa });
                                                            }
                                                        }
                                                    });
                                            }
                                        });
                                }
                            });
                    }
                });
        }
    });
};

///************************************************/
///*	FUNCTION: putGateway 						*/
///*  PARAMS: res,								*/
///*			req,								*/
///*			gtw, 								*/
///*          service,							*/
///*			f: callback function 				*/
///*  REV 1.0.2 VMG								*/
///************************************************/
exports.putGateway = function putGateway(req, res, gtw, service, f) {
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
            f(gtw);
        }
        else {
            // /// Comprobar que el nombre de la pasarela no exista
            // var querySelect = connection.query('SELECT idCGW FROM cgw WHERE name=?',gtw.name,function(err,rows){
            // 	if (err != null || (rows.length != 0 && rows[0].idCGW != gtw.idCGW)){
            // 		connection.end();
            // 		return f({error:'ER_DUP_ENTRY'});
            // 	}
            // 	else{
            var cpus = gtw.cpus;
            //var services = gtw.services;
            // Eliminar del JSON gtw la parte no general.
            delete gtw.cpus;
            //delete gtw.emplazamiento;

            // CÓDIGO ASINCRONO
            async.parallel([
                // Update CGW
                function(callback) {
                    // Si no existe el emplazamiento se da de alta.
                    // Puede ser que no exista si se recibe una configuración 
                    // de una pasarela que está en el sistema pero no en 
                    // en la configuración del servidor
                    getEmplazamiento(gtw.emplazamiento, req.body.idConf, function(result) {
                        if (result.error === null) {
                            gtw.EMPLAZAMIENTO_idEMPLAZAMIENTO = result.data.idEMPLAZAMIENTO;
                            delete gtw.emplazamiento;
                            updateCgw(connection, gtw, function(err) {
                                if (err) return callback(err);

                                callback(null);
                            });
                        }
                        else
                            callback(result.err);
                    });
                    /*
                    else{
                        delete gtw.emplazamiento;
                        updateCgw(connection, gtw, function(err){
                            if (err) return callback(err);

                            callback(null);
                        });

                    }*/
                },
                // Update CPUs (by deleting and adding)
                function(callback) {
                    delete gtw.emplazamiento;
                    updateCpus(connection, gtw, cpus, function(err) {
                        if (err) return callback(err);

                        callback(null);
                    });
                },
                // Update Services 
                function(callback) {
                    servicesLib.updateServices(connection, service, function(err) {
                        if (err) return callback(err);

                        callback(null);
                    });
                }
            ], function(err) {
                connection.end();

                if (err)
                    logging.Trace('Error in asynchronous PUT. ' + err.message);

                f(gtw);
            });
            //}
            //})
        }
    });
};

///********************************************************/
///*	FUNCTION: checkGatewayNameIp 						*/
///*	DESCRIPTION: checkGateway Name in configuration 	*/
///*  PARAMS: targetNameGateway: new name 4 gtw	 		*/
///*			f: callback function 						*/
///*														*/
///*  REV 1.0.2 VMG										*/
///********************************************************/
exports.checkGatewayNameIp = function(sourceIdGateway, targetNameGateway,
    ip0TargetGateway, ip1TargetGateway, f) {
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
            // Comprobar que el nombre de la pasarela y las Ips intorducidas
            // no exista ya en la configuracion
            var querySelect = connection.query('SELECT p.nombre,p.ip_cpu0,p.ip_cpu1 ' +
                'FROM pasarelas p ' +
                'LEFT JOIN emplazamientos e ON p.emplazamiento_id=e.idemplazamiento ' +
                'LEFT JOIN configuraciones c ON e.configuracion_id=c.idconfiguracion ' +
                'WHERE c.idconfiguracion = ( ' +
                '	SELECT c.idconfiguracion ' +
                '	FROM pasarelas p ' +
                '	LEFT JOIN emplazamientos e ON p.emplazamiento_id=e.idemplazamiento ' +
                '	LEFT JOIN configuraciones c ON e.configuracion_id=c.idconfiguracion ' +
                '	WHERE p.idpasarela=? ' +
                ')', [sourceIdGateway], function(err, rows) {
                    logging.Trace(querySelect.sql);
                    connection.end();
                    if (err != null)
                        return f({ error: 'ER_DUP_ENTRY' });
                    else {
                        for (var i = 0; i < rows.length; i++) {
                            if (rows[i].nombre == targetNameGateway) {
                                return f({ error: 'ER_DUP_ENTRY' });
                            }
                            if (rows[i].ip_cpu0 == ip0TargetGateway) {
                                return f({ error: 'ER_DUP_IP0_ENTRY' });
                            }
                            if (rows[i].ip_cpu1 == ip0TargetGateway) {
                                return f({ error: 'ER_DUP_IP0_ENTRY' });
                            }
                            if (rows[i].ip_cpu0 == ip1TargetGateway) {
                                return f({ error: 'ER_DUP_IP1_ENTRY' });
                            }
                            if (rows[i].ip_cpu1 == ip1TargetGateway) {
                                return f({ error: 'ER_DUP_IP1_ENTRY' });
                            }
                        }
                        return f({ data: 'OK' });
                    }
                });
        }
    });
};

///********************************************************/
///*	FUNCTION: copyGateway 								*/
///*	DESCRIPTION: Copy gateway hardware configuration 	*/
///*  PARAMS: sourceIdGateway: gatewayId 					*/
///*			targetNameGateway: new name 4 gtw	 		*/
///*			ipTargetGateway: new ip 4 gtw	 			*/
///*			f: callback function 						*/
///*														*/
///*  REV 1.0.2 VMG										*/
///********************************************************/
exports.copyGateway = function(sourceIdGateway, targetNameGateway,
    ip0TargetGateway, ip1TargetGateway, ipvTargetGateway, f) {
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
            return;
        }
        else {
            var oldGtwData = [];
            var newGtwId = 0;
            var oldGtwRadioResData = [];
            var linkedGtwRadioResData = [];
            var oldGtwTfnoResData = [];
            var linkedGtwTfnoResData = [];
            var oldGtwRadioResLista_UrisData = [];
            var oldGtwTfnoResRangos_AtsData = [];
            //// CODIGO ASÍNCRONO
            //async.waterfall([
            //    selectGateway,
            //    insertNewGtw,
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
            var selectGateway = function /*selectGateway*/(callback) {
                var query = connection.query('SELECT p.* ' +
                    'FROM pasarelas p ' +
                    'WHERE p.idpasarela=?', [sourceIdGateway],
                    function(err, rows) {
                        logging.Trace(query.sql);
                        if (err || rows.length == 0) {
                            logging.Error(err);
                            return callback(rows.length == 0 ? 'NO_DATA' : err);
                        }
                        else {
                            oldGtwData = rows;
                            return callback(null);
                        }
                    });
            };
            var insertNewGtw = async function /*insertNewGtw*/(callback) {
                var sppe =  oldGtwData[0].sppe ?  oldGtwData[0].sppe : 0;
                var dvrrp =  oldGtwData[0].dvrrp ?  oldGtwData[0].dvrrp : 2000;
                var stringQuery = 'INSERT INTO pasarelas (emplazamiento_id,nombre,ip_virtual,ultima_actualizacion,ip_cpu0,' +
                    'ip_gtw0,mask_cpu0,ip_cpu1,ip_gtw1,mask_cpu1,puerto_sip,periodo_supervision,puerto_servicio_snmp,' +
                    'puerto_snmp,snmpv2,comunidad_snmp,nombre_snmp,localizacion_snmp,contacto_snmp,puerto_servicio_web,' +
                    'tiempo_sesion,puerto_rtsp,servidor_rtsp, servidor_rtspb, sppe, dvrrp) ' +
                    'VALUES (' + oldGtwData[0].emplazamiento_id + ',"' + targetNameGateway + '","' + ipvTargetGateway + '",NOW()' +
                    ',"' + ip0TargetGateway + '","' + oldGtwData[0].ip_gtw0 + '","' + oldGtwData[0].mask_cpu0 + '"' +
                    ',"' + ip1TargetGateway + '","' + oldGtwData[0].ip_gtw1 + '","' + oldGtwData[0].mask_cpu1 + '"' +
                    ',"' + oldGtwData[0].puerto_sip + '","' + oldGtwData[0].periodo_supervision + '","' + oldGtwData[0].puerto_servicio_snmp + '"' +
                    ',"' + oldGtwData[0].puerto_snmp + '","' + oldGtwData[0].snmpv2 + '","' + oldGtwData[0].comunidad_snmp + '"' +
                    ',"' + oldGtwData[0].nombre_snmp + '","' + oldGtwData[0].localizacion_snmp + '","' + oldGtwData[0].contacto_snmp + '"' +
                    ',"' + oldGtwData[0].puerto_servicio_web + '","' + oldGtwData[0].tiempo_sesion + '","' + oldGtwData[0].puerto_rtsp + '"' +
                    ',"' + oldGtwData[0].servidor_rtsp + '","' + oldGtwData[0].servidor_rtspb + '"' +
                    ',' + sppe +
                    ',' + dvrrp +
                    ');';
                var query = connection.query(stringQuery, function(err, result) {
                    logging.Trace(query.sql);
                    if (err) {
                        logging.Error(err);
                        return callback(rows.length == 0 ? 'NO_DATA' : err);
                    }
                    else {
                        newGtwId = result.insertId;
                        return callback(null);
                    }
                });
            };
            var selectGatewayIps = function /*selectGatewayIps*/(callback) {
                var query = connection.query('SELECT li.* ' +
                    'FROM pasarelas p ' +
                    'LEFT JOIN lista_ips li ON p.idpasarela=li.pasarela_id ' +
                    'WHERE p.idpasarela=?', [sourceIdGateway],
                    function(err, rows) {
                        logging.Trace(query.sql);
                        if (err || rows.length == 0) {
                            logging.Error(err);
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
                for (var i = 0; i < oldGtwIpData.length; i++) {
                    query = 'INSERT INTO lista_ips (pasarela_id,ip,tipo,selected) ' +
                        'VALUES (' + newGtwId + ',"' + oldGtwIpData[i].ip + '","' + oldGtwIpData[i].tipo + '"' +
                        ',"' + oldGtwIpData[i].selected + '");';
                    res = await ug5kdb.QueryMultiInsertSync(query);
                    if (res.error){
                        logging.Error(res.error);
                    }
                }
                return callback(null);
            };
            var selectGatewayRadioRes = function /*selectGatewayRadioRes*/(callback) {
                var query = connection.query('SELECT rr.* ' +
                    'FROM pasarelas p ' +
                    'LEFT JOIN recursos_radio rr ON p.idpasarela=rr.pasarela_id ' +
                    'WHERE p.idpasarela=?', [sourceIdGateway],
                    function(err, rows) {
                        logging.Trace(query.sql);
                        if (err || rows.length == 0) {
                            logging.Error(err);
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
                for (var i = 0; i < oldGtwRadioResData.length; i++) {
                    if (oldGtwRadioResData[i].pasarela_id != null) {
                        if (oldGtwRadioResData[i].clave_registro == null) {
                            query = 'INSERT INTO recursos_radio (pasarela_id,fila,columna,nombre,codec,' +
                                'frecuencia,ajuste_ad,ajuste_da,precision_audio,tipo_agente,indicacion_entrada_audio,' +
                                'indicacion_salida_audio,umbral_vad,metodo_bss,evento_ptt_squelch,prioridad_ptt,prioridad_sesion_sip,' +
                                'climax_bss,tabla_bss_id,retraso_interno_grs,habilita_grabacion,restriccion_entrantes) ' +
                                'VALUES ' +
                                '(' + newGtwId + ',' + oldGtwRadioResData[i].fila + ',' + oldGtwRadioResData[i].columna + '' +
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
                                '(' + newGtwId + ',' + oldGtwRadioResData[i].fila + ',' + oldGtwRadioResData[i].columna + '' +
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
                        if (!res.error) {
                            var element = new Object();
                            element.oldRrId = oldGtwRadioResData[i].idrecurso_radio;
                            element.newRrId = res.data.insertId;
                            linkedGtwRadioResData.push(element);
                        }
                        else {
                            logging.Error(res.error);
                        }
                    }
                }
                return callback(null);
            };
            var selectGatewayTfnoRes = function /*selectGatewayTfnoRes*/(callback) {
                var query = connection.query('SELECT rt.* ' +
                    'FROM pasarelas p ' +
                    'LEFT JOIN recursos_telefono rt ON p.idpasarela=rt.pasarela_id ' +
                    'WHERE p.idpasarela=?', [sourceIdGateway],
                    function(err, rows) {
                        logging.Trace(query.sql);
                        if (err || rows.length == 0) {
                            logging.Error(err);
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
                for (var i = 0; i < oldGtwTfnoResData.length; i++) {
                    if (oldGtwTfnoResData[i].pasarela_id != null) {
                        if (oldGtwTfnoResData[i].clave_registro == null) {
                            query = 'INSERT INTO recursos_telefono (pasarela_id,fila,columna,nombre,' +
                                'codec,ajuste_ad,ajuste_da,tipo_interfaz_tel,uri_telefonica,deteccion_vox,umbral_vox,' +
                                'cola_vox,respuesta_automatica,periodo_tonos,lado,origen_test,destino_test,supervisa_colateral,' +
                                'tiempo_supervision,duracion_tono_interrup, ats_user, det_inversion_pol) ' +
                                'VALUES ' +
                                '(' + newGtwId + ',' + oldGtwTfnoResData[i].fila + ',' + oldGtwTfnoResData[i].columna + '' +
                                ',"' + oldGtwTfnoResData[i].nombre + '",' + oldGtwTfnoResData[i].codec + '' +
                                ',' + oldGtwTfnoResData[i].ajuste_ad + ',' + oldGtwTfnoResData[i].ajuste_da + '' +
                                ',' + oldGtwTfnoResData[i].tipo_interfaz_tel + ',"' + oldGtwTfnoResData[i].uri_telefonica + '",' + oldGtwTfnoResData[i].deteccion_vox + '' +
                                ',' + oldGtwTfnoResData[i].umbral_vox + ',' + oldGtwTfnoResData[i].cola_vox + ',' + oldGtwTfnoResData[i].respuesta_automatica + '' +
                                ',' + oldGtwTfnoResData[i].periodo_tonos + ',' + oldGtwTfnoResData[i].lado + ',"' + oldGtwTfnoResData[i].origen_test + '","' + oldGtwTfnoResData[i].destino_test + '"' +
                                ',' + oldGtwTfnoResData[i].supervisa_colateral + ',' + oldGtwTfnoResData[i].tiempo_supervision + ',' + oldGtwTfnoResData[i].duracion_tono_interrup + '' +
                                ',' + '"' + oldGtwTfnoResData[i].ats_user + '", ' + oldGtwTfnoResData[i].det_inversion_pol + 
                                ');';
                        }
                        else {
                            query = 'INSERT INTO recursos_telefono (pasarela_id,fila,columna,nombre,' +
                                'codec,clave_registro,ajuste_ad,ajuste_da,tipo_interfaz_tel,uri_telefonica,deteccion_vox,umbral_vox,' +
                                'cola_vox,respuesta_automatica,periodo_tonos,lado,origen_test,destino_test,supervisa_colateral,' +
                                'tiempo_supervision,duracion_tono_interrup, ats_user, det_inversion_pol) ' +
                                'VALUES ' +
                                '(' + newGtwId + ',' + oldGtwTfnoResData[i].fila + ',' + oldGtwTfnoResData[i].columna + '' +
                                ',"' + oldGtwTfnoResData[i].nombre + '",' + oldGtwTfnoResData[i].codec + ',"' + oldGtwTfnoResData[i].clave_registro + '"' +
                                ',' + oldGtwTfnoResData[i].ajuste_ad + ',' + oldGtwTfnoResData[i].ajuste_da + '' +
                                ',' + oldGtwTfnoResData[i].tipo_interfaz_tel + ',"' + oldGtwTfnoResData[i].uri_telefonica + '",' + oldGtwTfnoResData[i].deteccion_vox + '' +
                                ',' + oldGtwTfnoResData[i].umbral_vox + ',' + oldGtwTfnoResData[i].cola_vox + ',' + oldGtwTfnoResData[i].respuesta_automatica + '' +
                                ',' + oldGtwTfnoResData[i].periodo_tonos + ',' + oldGtwTfnoResData[i].lado + ',"' + oldGtwTfnoResData[i].origen_test + '","' + oldGtwTfnoResData[i].destino_test + '"' +
                                ',' + oldGtwTfnoResData[i].supervisa_colateral + ',' + oldGtwTfnoResData[i].tiempo_supervision + ',' + oldGtwTfnoResData[i].duracion_tono_interrup + '' +
                                ',' + '"' + oldGtwTfnoResData[i].ats_user + '", ' + oldGtwTfnoResData[i].det_inversion_pol + 
                                ');';
                        }
                        res = await ug5kdb.QueryMultiInsertSync(query);
                        if (!res.error) {
                            var element = new Object();
                            element.oldRtId = oldGtwTfnoResData[i].idrecurso_telefono;
                            element.newRtId = res.data.insertId;
                            linkedGtwTfnoResData.push(element);
                        }
                        else {
                            logging.Error(res.error);
                        }
                    }
                }
                return callback(null);
            };
            var selectRadioResLista_Uris = function /*selectRadioResLista_Uris*/(callback) {
                var query = connection.query('SELECT lu.* ' +
                    'FROM pasarelas p ' +
                    'LEFT JOIN recursos_radio rr ON p.idpasarela=rr.pasarela_id ' +
                    'LEFT JOIN lista_uris lu ON rr.idrecurso_radio=lu.recurso_radio_id ' +
                    'WHERE p.idpasarela=?', [sourceIdGateway],
                    function(err, rows) {
                        logging.Trace(query.sql);
                        if (err || rows.length == 0) {
                            logging.Error(err);
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
                        if (res.error) {
                            logging.Error(res.error);
                        }
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
                    'FROM pasarelas p ' +
                    'LEFT JOIN recursos_telefono rt ON p.idpasarela=rt.pasarela_id ' +
                    'LEFT JOIN rangos_ats ra ON rt.idrecurso_telefono=ra.recurso_telefonico_id ' +
                    'WHERE p.idpasarela=?', [sourceIdGateway],
                    function(err, rows) {
                        logging.Trace(query.sql);
                        if (err || rows.length == 0) {
                            logging.Error(err);
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
                        if (res.error) {
                            logging.Error(res.error);
                        }
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
                selectGateway,
                insertNewGtw,
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

exports.freeGatewayFromConfiguration = function freeGatewayFromConfiguration(cgw_cfg, f) {
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
            var querySelect = connection.query('SELECT idCGW_CFG from CGW_CFG WHERE CFG_idCFG=? AND CGW_idCGW=? AND Activa=1', [cgw_cfg.CFG_idCFG, cgw_cfg.CGW_idCGW], function(err, rows, fields) {
                logging.Trace(querySelect.sql);
                if (rows == null || rows.length == 0) {
                    var query = connection.query('DELETE FROM CGW WHERE idCGW=?', [cgw_cfg.CGW_idCGW], function(err, result) {
                        logging.Trace(query.sql);
                        connection.end();
                        f({ error: result.affectedRows, data: cgw_cfg });

                        return;
                    });
                }
                else {
                    querySelect = connection.query('UPDATE CGW_CFG SET Activa=-1 WHERE CFG_idCFG=? AND CGW_idCGW=?', [cgw_cfg.CFG_idCFG, cgw_cfg.CGW_idCGW], function(err, result) {
                        logging.Trace(querySelect.sql);
                        connection.end();
                        f({ error: result.affectedRows, data: cgw_cfg });
                    });
                }
            });
        }
    });
};

exports.assignGatewayToConfiguration = function assignGatewayToConfiguration(cgw_cfg, f) {
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
            connection.end();
            return;
        }
        else {
            // Comprobar si la pasarela que se recibe pertenece a la configuración activa
            var queryExists = connection.query('SELECT activa FROM cfg WHERE idCFG=?', cgw_cfg.CFG_idCFG, function(err, rows) {
                if (err == null && rows.length > 0) {
                    cgw_cfg.Activa = rows[0].activa;
                    var querySelect = connection.query('SELECT idCGW_CFG from CGW_CFG WHERE CFG_idCFG=? AND CGW_idCGW=?', [cgw_cfg.CFG_idCFG, cgw_cfg.CGW_idCGW], function(err, rows, fields) {
                        logging.Trace(querySelect.sql);
                        if (rows == null || rows.length == 0) {
                            var query = connection.query('INSERT INTO CGW_CFG SET ?', cgw_cfg, function(err, result) {
                                logging.Trace(query.sql);



                                //Actualizar tabla CGW_ESTADO
                                var querySelectSite = connection.query('SELECT EMPLAZAMIENTO_idEMPLAZAMIENTO FROM CGW WHERE idCGW=?', cgw_cfg.CGW_idCGW, function(err, rows) {
                                    logging.Trace(querySelectSite.sql);
                                    if (rows != null || rows.length != 0) {
                                        var emplazamiento = rows[0].EMPLAZAMIENTO_idEMPLAZAMIENTO;
                                        var querytext = 'INSERT INTO CGW_ESTADO (cgw_idCGW,cgw_EMPLAZAMIENTO_idEMPLAZAMIENTO) VALUES (' + cgw_cfg.CGW_idCGW + ',' + emplazamiento + ')';

                                        var queryInsert = connection.query(querytext, function(err, result) {
                                            //logging.Trace(queryInsert.sql);
                                            connection.end();

                                            if (err)
                                                f({ error: err, data: cgw_cfg });
                                            else
                                                f({ error: result.affectedRows, data: cgw_cfg });

                                            //return;
                                        });

                                    }
                                    else
                                        connection.end();
                                });


                                //connection.end();
								/*if (err)
									f({error:err, data: cgw_cfg});
								else
									f({error: result.affectedRows, data: cgw_cfg});
*/


                                //return;
                            });
                        }
                        else {
                            querySelect = connection.query('UPDATE CGW_CFG SET Activa=? WHERE CFG_idCFG=? AND CGW_idCGW=?', [cgw_cfg.Activa, cgw_cfg.CFG_idCFG, cgw_cfg.CGW_idCGW], function(err, result) {
                                logging.Trace(querySelect.sql);
                                connection.end();
                                f({ error: result.affectedRows, data: cgw_cfg });
                            });
                        }





                    });
                }
                else {
                    //connection.end();
                    f({ error: err, data: cgw_cfg });
                }
            });
        }

    });

};

exports.gatewayExists = function gatewayExists(nameConf, newGateway, f) {
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
            // Comprobar si la pasarela existe en la configuración 
            var queryExists = connection.query(
                'SELECT c.name, c2.CFG_idCFG, c3.name ' +
                'FROM cgw c ' +
                'LEFT JOIN cgw_cfg c2 ON c.idCGW = c2.CGW_idCGW ' +
                'LEFT JOIN cfg c3 ON c2.CFG_idCFG = c3.idCFG ' +
                'WHERE c.name = ?', newGateway.name, function(err, rows) {
                    logging.Trace(queryExists.sql);
                    connection.end();
                    if (err == null) {
                        if (rows.length > 0) {
                            f({ error: 'OK', data: rows });
                        }
                        else {
                            f({ error: null, data: 0 });
                        }
                    }
                    else
                        f({ error: err, data: null });
                });
        }
    });
};


////////////////////////////////
/// Name: CloneGateway
/// Desc: Create gateway gtw and assign it the resources of srcGtwId.
////////////////////////////////
exports.CloneGateway = function(srcGtwId, gtw, f) {
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
            var gtwJson = {
                EMPLAZAMIENTO_idEMPLAZAMIENTO: gtw.EMPLAZAMIENTO_idEMPLAZAMIENTO,
                REGIONES_idREGIONES: gtw.REGIONES_idREGIONES,
                servicio: gtw.servicio,
                name: gtw.name,
                dualidad: gtw.dualidad,
                ipv: gtw.ipv,
                ips: gtw.ips,
                nivelconsola: gtw.nivelconsola,
                puertoconsola: gtw.puertoconsola,
                nivelIncidencias: gtw.nivelIncidencias
            };

            var queryInsert = connection.query('INSERT INTO cgw SET ?', [gtwJson], function(err, resultCgw) {
                logging.Trace(queryInsert.sql);
                if (err == null) {
                    var queryCpu = connection.query('INSERT INTO cpu (CGW_idCGW,num,tlan,ip0,ms0,ip1,ms1,ipb,msb,ipg) ' +
                        'SELECT ?,num,tlan,ip0,ms0,ip1,ms1,ipb,msb,ipg FROM cpu WHERE CGW_idCGW=?', [resultCgw.insertId, srcGtwId], function(err, resultCpu) {
                            logging.Trace(queryCpu.sql);

                            var posTargetIds = [];
                            /// whilst = for (int i=0;i<4;i++)
                            var i = 0;
                            async.whilst(
                                function() { return i < 4; },
                                function(callback) {
                                    var nameSlave = gtw.name + '_' + i++;
                                    ///	Copiar slaves
                                    var querySlaves = connection.query('INSERT INTO slaves (name,tp) VALUES (?,0)', nameSlave, function(err, resultSlaves) {
                                        logging.Trace(querySlaves.sql);
                                        posTargetIds.push(resultSlaves.insertId);

                                        /// Copiar hardware
                                        var queryHw = connection.query('INSERT INTO hardware (CGW_idCGW,SLAVES_idSLAVES,rank) VALUES (?,?,?)', [resultCgw.insertId, resultSlaves.insertId, i - 1], function(err, resultHw) {
                                            logging.Trace(queryHw.sql);

                                            callback(null);
                                        });
                                    });
                                },
                                function(err) {
                                    connection.end();
                                    ///
                                    /// Ha finalizado de copiar slaves y hardware
                                    /// 
                                    exports.getHardwareByIdGateway(srcGtwId, function(result) {
                                        var cuantos = 0;
                                        if (result.hardware != null && result.hardware.length > 0) {
                                            async.each(result.hardware,
                                                function(p, callback) {
                                                    //myLibHardware.getSlave(p.SLAVES_idSLAVES,function(data){
                                                    exports.copyResources(p.idSLAVES, posTargetIds[cuantos++], function(error) {
                                                        callback();
                                                    });
                                                    //});
                                                },
                                                function(err) {
                                                    return f({ error: err, data: resultCgw.insertId });
                                                }
                                            );
                                        }
                                        else
                                            return f({ error: null, data: 0 });
                                    });
                                }
                            );
                        });
                }
                else {
                    connection.end();
                    return f({ error: err, data: -1 });
                }
            });
        }
    });
};

///************************************************/
///*	FUNCTION: setService 						*/
///*	DESCRIPTION: Assign a service to gateway 	*/
///*  PARAMS: gateway: 							*/
///*			service,							*/
///*			f: callback function 				*/
///************************************************/
exports.setService = function setService(gateway, service, f) {
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
        else {
            updateService(connection, gateway, service, function(result) {
                connection.end();
                f(result);
            });
        }
    });
};

///********************************************************/
///*	FUNCTION: getTestConfig								*/
///*	DESCRIPTION: Get version of active configuration 	*/
///*  PARAMS: gatewayIp 									*/
///*			f: callback function 						*/
///********************************************************/
exports.getTestConfig = function getTestConfig(gatewayIp, f) {
    var mySql = require('mySql');
    var connection = ug5kdb.GetDbConnectionOnTz('+02:00');/* mySql.createConnection({
        host: gcfg.Ulises.dbhost,
        user: gcfg.Ulises.dbuser,
        password: gcfg.Ulises.dbpassword,
        database: gcfg.Ulises.dbdatabase,
        timezone: '+02:00'
    });*/

    connection.connect(function(err) {
        if (err) {
            logging.Error("Error connention to 'U5K-G' database.");
        }
        else {
            // Actualiza cgw_estado
            var updateEstado = "";
            updateEstado = connection.query("UPDATE cgw_estado SET viva=1 WHERE cgw_idCGW IN (SELECT idCGW FROM cgw WHERE ipv=?)", gatewayIp, function(err, result) {
                var timerId = 'ug5k._' + gatewayIp.replace(/\./g, '_') + '_event_viva';
                var drop = connection.query('DROP EVENT ' + timerId, function(error, result1) {
                    var createEvent = connection.query('CREATE EVENT IF NOT EXISTS ' + timerId + ' ON SCHEDULE ' +
                        'AT CURRENT_TIMESTAMP + INTERVAL 60 SECOND ' +
                        'COMMENT "UPDATE VIVA STATE OF GATEWAYS." ' +
                        'DO BEGIN UPDATE cgw_estado SET viva = 0 WHERE cgw_idCGW IN (SELECT idCGW FROM cgw WHERE ipv=?);' +
                        'DELETE FROM cgw_fisica WHERE ip=?; END', [gatewayIp, gatewayIp], function(error, result2) {
                            logging.Trace(createEvent.sql);


                            var query = "";
                            query = connection.query('SELECT cc.idCGW_CFG,cc.CGW_idCGW, c.idCfg, c.name, DATE_FORMAT(cc.LastUpdate, "%d/%m/%Y %H:%i:%s") as ts_activa,c.activa,cc.Activa FROM CGW g ' +
                                'LEFT JOIN cgw_cfg cc ON g.idCGW = cc.CGW_idCGW ' +
                                'LEFT JOIN cfg c on c.idCFG = cc.CFG_idCFG ' +
                                'WHERE g.ipv=?', gatewayIp, function(err, rows, fields) {
                                    logging.Trace(query.sql);

                                    if (err) {
                                        connection.end();
                                        f({ idConf: '-1', fechaHora: '' });
                                        logging.Trace(JSON.stringify({ idConf: '-1', fechaHora: '' }, null, '\t'));
                                    }
                                    else if (rows == null || rows.length == 0) {
                                        connection.end();
                                        f({ idConf: '-1', fechaHora: '' });
                                        logging.Trace(JSON.stringify({ idConf: '-1', fechaHora: '' }, null, '\t'));
                                    }
                                    else {
                                        var retorno = { idConf: '', fechaHora: '' };
                                        async.each(rows,
                                            function(r, callback) {
                                                //if ((r.Activa == null || r.Activa == 0) && retorno.idConf == ''){
                                                if ((r.activa == null || r.activa == 0) && retorno.idConf == '') {
                                                    retorno.idConf = '-2';
                                                    callback();
                                                }
                                                else if (r.activa == 1) {		// && r.Activa != 0){
                                                    // Suponemos que la configuración de la pasarela, en esta situación, está sincronizada
                                                    var update = connection.query('UPDATE cgw_cfg SET Sincro=2 WHERE idCGW_CFG=? AND (Sincro=1 OR Sincro=3)', r.idCGW_CFG, function(error, result) {
                                                        var timerId = 'ug5k.' + r.CGW_idCGW + '_event_synchro';
                                                        var altera1 = connection.query('DROP EVENT ' + timerId, function(error, result1) {
                                                            /*						    						var altera2=connection.query('CREATE EVENT IF NOT EXISTS ' + timerId + ' ON SCHEDULE ' +
                                                                                                                                                        'AT CURRENT_TIMESTAMP + INTERVAL 60 SECOND ' +
                                                                                                                                                    'COMMENT "UPDATE SYNCHRONIZED STATE OF GATEWAYS." ' +
                                                                                                                                                'DO BEGIN UPDATE ug5k.cgw_cfg SET Sincro = 3 WHERE Sincro = 2 AND Activa = 1 AND CGW_idCGW=?;'+
                                                                                                                                                'UPDATE cgw_estado SET viva = 0 WHERE cgw_idCGW=?;END',[r.CGW_idCGW,r.CGW_idCGW],function(error,result2){*/

                                                            var altera2 = connection.query('CREATE EVENT IF NOT EXISTS ' + timerId + ' ON SCHEDULE ' +
                                                                'AT CURRENT_TIMESTAMP + INTERVAL 60 SECOND ' +
                                                                'COMMENT "UPDATE SYNCHRONIZED STATE OF GATEWAYS." ' +
                                                                'DO BEGIN UPDATE ug5k.cgw_cfg SET Sincro = 3 WHERE Sincro = 2 AND Activa = 1 AND CGW_idCGW=?;' +
                                                                'UPDATE cgw_estado SET viva = 0 WHERE cgw_idCGW IN (SELECT idCGW FROM cgw WHERE ipv=?);END', [r.CGW_idCGW, gatewayIp], function(error, result2) {


                                                                    logging.Trace(update.sql);

                                                                    retorno.idConf = r.name;
                                                                    retorno.fechaHora = r.ts_activa + ' UTC';
                                                                    callback();
                                                                });
                                                        });
                                                    });
                                                }
                                                else
                                                    callback();
                                            },
                                            function(err) {
                                                //logging.Trace(JSON.stringify(rows[0],null,'\t'));
                                                connection.end();
                                                logging.Trace(JSON.stringify(retorno, null, '\t'));
                                                f(retorno);
                                                //f({idConf:rows[0].idCfg, fechaHora:rows[0].ts_activa});
                                            }
                                        );
                                    }
                                });
                        });
                });
            });
        }
    });
};

///********************************************************/
///*	FUNCTION: getHardware 								*/
///*	DESCRIPTION: Get gateway hardware configuration 	*/
///*  PARAMS: gtw: gatewayIp 								*/
///*			f: callback function 						*/
///*  REV 1.0.2 VMG										*/
///********************************************************/
exports.getHardware = function getHardware(gtw, f) {
    var mySql = require('mySql');
    var connection = ug5kdb.GetDbConnectionOnTz('+02:00');/* mySql.createConnection({
        host: gcfg.Ulises.dbhost,
        user: gcfg.Ulises.dbuser,
        password: gcfg.Ulises.dbpassword,
        database: gcfg.Ulises.dbdatabase,
        timezone: '+02:00'
    });*/

    connection.connect(function(err) {
        if (err) {
            logging.Error("Error connention to 'U5K-G' database.");
        }
        else {
            var query = "";
            query = connection.query('SELECT S.*,H.CGW_idCGW,H.rank,c.ipv FROM SLAVES S ' +
                'LEFT JOIN hardware H ON S.idSLAVES = h.SLAVES_idSLAVES ' +
                'LEFT JOIN cgw c ON h.CGW_idCGW = c.idCGW ' +
                'WHERE c.idCGW=? ORDER BY S.name', gtw, function(err, rows, fields) {
                    logging.Trace(query.sql);
                    connection.end();
                    if (err) {
                        f({ error: err, hardware: null });
                    }
                    else if (rows == null || rows.length == 0) {
                        f({ error: err, hardware: null });
                    }
                    else {
                        logging.Trace(JSON.stringify(rows, null, '\t'));
                        f({ error: null, hardware: rows });
                    }
                });
        }
    });
};

///********************************************************/
///*	FUNCTION: createGateWayonSite 						*/
///*	DESCRIPTION: Create new gateway 					*/
///*  PARAMS: gtw: gateway data 							*/
///*			idSite: site id								*/
///*			f: callback function 						*/
///*  REV 1.0.2 VMG										*/
///********************************************************/
exports.createGateWayonSite = function createGateWayonSite(gtw, idSite, f) {
    var mySql = require('mySql');
    var connection = ug5kdb.GetDbConnectionOnTz('+02:00');/* mySql.createConnection({
        host: gcfg.Ulises.dbhost,
        user: gcfg.Ulises.dbuser,
        password: gcfg.Ulises.dbpassword,
        database: gcfg.Ulises.dbdatabase,
        timezone: '+02:00',
        multipleStatements: true
    });*/

    connection.connect(function(err) {
        if (err) {
            logging.Error("Error connention to 'U5K-G' database.");
        }
        else {
            var query = "";
            var sppe = gtw.sppe ? gtw.sppe : 0;
            var dvrrp = gtw.dvrrp ? gtw.dvrrp : 2000;
            query = connection.query('INSERT INTO pasarelas (emplazamiento_id,nombre,ip_virtual,ip_cpu0,ip_gtw0,' +
                'mask_cpu0,ip_cpu1,ip_gtw1,mask_cpu1,puerto_snmp,puerto_servicio_snmp,' +
                'periodo_supervision,snmpv2,comunidad_snmp,puerto_servicio_web,tiempo_sesion,' +
                'puerto_rtsp,servidor_rtsp,servidor_rtspb,ultima_actualizacion, sppe,dvrrp) ' +
                'VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,NOW(),?,?)',
                [idSite, gtw.nombre, gtw.ipv, gtw.ipb1, gtw.ipg1, gtw.msb1, gtw.ipb2, gtw.ipg2, gtw.msb2, gtw.puerto_snmp,
                    gtw.puerto_servicio_snmp, gtw.periodo_supervision, gtw.snmpv2, gtw.comunidad_snmp, gtw.puerto_servicio_web,
                    gtw.tiempo_sesion, gtw.puerto_rtsp, gtw.servidor_rtsp, gtw.servidor_rtspb, sppe, dvrrp],
                function(err, rows) {
                    logging.Trace(query.sql);
                    if (err) {
                        connection.end();
                        return f({ error: err.message });
                    }
                    else {
                        var lista_ips = getFormattedIps(gtw);
                        if (lista_ips.length > 0) {
                            var queries = '';
                            lista_ips.forEach(function(item) {
                                queries += mySql.format('INSERT INTO lista_ips (pasarela_id,ip,tipo) ' +
                                    'VALUES (?,?,?); ', [rows.insertId, item.ip, item.tipo]);
                            });
                            connection.query(queries, function(err, results) {
                                connection.end();
                                if (err) {
                                    return f({ error: err.message });
                                }
                                else
                                    return f({ insertId: rows.insertId, name: gtw.nombre, error: null });
                            });
                        }
                        else {
                            connection.end();
                            return f({ insertId: rows.insertId, name: gtw.nombre, error: null, aplicarcambios: 0 });
                        }//No se inserta ninguna ip

                    }
                });
        }
    });
};

///********************************************************/
///*	FUNCTION: updateGateWayonSite 						*/
///*	DESCRIPTION: Update new gateway 					*/
///*  PARAMS: gtw: gateway data 							*/
///*			idGtw: Gtw id								*/
///*			f: callback function 						*/
///*  REV 1.0.2 VMG										*/
///********************************************************/
// exports.updateGateWayonSite_old = function updateGateWayonSite(gtw, idGtw, f) {
//     var mySql = require('mySql');
//     var connection = ug5kdb.GetDbConnectionOnTz('+02:00');/* mySql.createConnection({
//         host: gcfg.Ulises.dbhost,
//         user: gcfg.Ulises.dbuser,
//         password: gcfg.Ulises.dbpassword,
//         database: gcfg.Ulises.dbdatabase,
//         timezone: '+02:00',
//         multipleStatements: true
//     });*/

//     connection.connect(function(err) {
//         if (err) {
//             logging.Trace("Error connention to 'U5K-G' database.");
//         }
//         else {
//             logging.Trace("Successful connection to 'U5K-G' database!");

//             var pendiente_actualizar = 1;
//             var query = connection.query('UPDATE pasarelas SET nombre=?,ip_virtual=?,ip_cpu0=?,ip_gtw0=?,' +
//                 'mask_cpu0=?,ip_cpu1=?,ip_gtw1=?,mask_cpu1=?,puerto_snmp=?,puerto_servicio_snmp=?,' +
//                 'periodo_supervision=?,snmpv2=?,comunidad_snmp=?,puerto_servicio_web=?,tiempo_sesion=?, ' +
//                 'puerto_rtsp=?,servidor_rtsp=?,servidor_rtspb=?,pendiente_actualizar=?, sppe=? WHERE idpasarela=?',
//                 [gtw.nombre, gtw.ipv, gtw.ipb1, gtw.ipg1, gtw.msb1, gtw.ipb2, gtw.ipg2, gtw.msb2, gtw.puerto_snmp,
//                 gtw.puerto_servicio_snmp, gtw.periodo_supervision, gtw.snmpv2, gtw.comunidad_snmp, gtw.puerto_servicio_web,
//                 gtw.tiempo_sesion, gtw.puerto_rtsp, gtw.servidor_rtsp, gtw.servidor_rtspb, pendiente_actualizar, gtw.sppe, idGtw],
//                 function(err, rows) {
//                     logging.Trace(query.sql);
//                     if (err) {
//                         connection.end();
//                         return f({ error: err.message });
//                     }
//                     else {
//                         //Primero borramos todas las ips de lista_ips de esa pasarela y luego las volvemos a insertar.
//                         //Me parece menos lioso.
//                         var delQuery = '';
//                         delQuery = connection.query('DELETE FROM lista_ips WHERE pasarela_id=?', [idGtw],
//                             function(err, rows) {
//                                 logging.Trace(query.sql);
//                                 if (err) {
//                                     connection.end();
//                                     return f({ error: err.message });
//                                 }
//                                 else {
//                                     var lista_ips = getFormattedIps(gtw);
//                                     if (lista_ips.length > 0) {
//                                         var queries = '';
//                                         lista_ips.forEach(function(item) {
//                                             queries += mySql.format('INSERT INTO lista_ips (pasarela_id,ip,tipo) ' +
//                                                 'VALUES (?,?,?); ', [idGtw, item.ip, item.tipo]);
//                                         });
//                                         connection.query(queries, function(err, results) {
//                                             connection.end();
//                                             if (err) {
//                                                 return f({ error: err.message });
//                                             }
//                                             else
//                                                 return f({ insertId: rows.insertId, name: gtw.nombre, error: null });
//                                         });
//                                     }
//                                     else {
//                                         connection.end();
//                                         return f({ insertId: rows.insertId, name: gtw.nombre, error: null });
//                                     }//No se inserta ninguna ip

//                                 }
//                             });
//                     }
//                 });
//         }
//     });
// };
/**
 * 20190213. Se actualizac la funcion para que marque como pendiente de actualizar las pasarelas de la configuracion activa.
 *           Se pasan las consultas a BD a modo sincrono...
 * @param {any} gtw
 * @param {any} idGtw
 * @param {any} f
 */
exports.updateGateWayonSite = async function updateGateWayonSite(gtw, idGtw, f) {
    var mySql = require('mySql');
    var connection = ug5kdb.GetDbConnectionOnTz('+02:00');

    var strQuery = 'SELECT configuraciones.activa FROM configuraciones ' +
        'LEFT JOIN emplazamientos ON configuraciones.idconfiguracion = emplazamientos.configuracion_id ' +
        'LEFT JOIN pasarelas ON pasarelas.emplazamiento_id=emplazamientos.idemplazamiento ' +
        'WHERE pasarelas.idpasarela= ' + idGtw;
    var res = await ug5kdb.QuerySync(strQuery);
    var pendiente_actualizar = res.error ? 1 : res.data[0] ? res.data[0].activa : 0;
    var sppe = gtw.sppe ? gtw.sppe : 0;
    var dvrrp = gtw.dvrrp ? gtw.dvrrp : 2000;

    strQuery = 'UPDATE pasarelas SET nombre=?,ip_virtual=?,ip_cpu0=?,ip_gtw0=?,' +
        'mask_cpu0=?,ip_cpu1=?,ip_gtw1=?,mask_cpu1=?,puerto_snmp=?,puerto_servicio_snmp=?,' +
        'periodo_supervision=?,snmpv2=?,comunidad_snmp=?,puerto_servicio_web=?,tiempo_sesion=?, ' +
        'puerto_rtsp=?,servidor_rtsp=?,servidor_rtspb=?,pendiente_actualizar=?, sppe=?, dvrrp=? WHERE idpasarela=?';
    var parQuery = [gtw.nombre, gtw.ipv, gtw.ipb1, gtw.ipg1, gtw.msb1, gtw.ipb2, gtw.ipg2, gtw.msb2, gtw.puerto_snmp,
    gtw.puerto_servicio_snmp, gtw.periodo_supervision, gtw.snmpv2, gtw.comunidad_snmp, gtw.puerto_servicio_web,
    gtw.tiempo_sesion, gtw.puerto_rtsp, gtw.servidor_rtsp, gtw.servidor_rtspb, pendiente_actualizar, 
    sppe, dvrrp,
    idGtw];

    res = await ug5kdb.QuerySync(strQuery, parQuery);
    if (res.error) {
        return f({ error: 'Error en consulta: ' + strQuery });
    }
    else {
        //Primero borramos todas las ips de lista_ips de esa pasarela y luego las volvemos a insertar.
        //Me parece menos lioso.
        strQuery = 'DELETE FROM lista_ips WHERE pasarela_id=' + idGtw;
        res = await ug5kdb.QuerySync(strQuery);
        if (res.error) {
            return f({ error: err.message });
        }
        else {
            var lista_ips = getFormattedIps(gtw);
            if (lista_ips.length > 0) {
                var queries = '';
                lista_ips.forEach(function(item) {
                    queries += mySql.format('INSERT INTO lista_ips (pasarela_id,ip,tipo) ' +
                        'VALUES (?,?,?); ', [idGtw, item.ip, item.tipo]);
                });
                res = await ug5kdb.QueryMultiInsertSync(queries);
                if (res.error) {
                    return f({ error: err.message });
                }
                return f({ name: gtw.nombre, error: null, aplicarcambios: pendiente_actualizar });
            }
        }
    }
};

///************************************/
///*	FUNCTION: getHardwareResume 	*/
///*  PARAMS: idGtw,					*/
///*          f  						*/
///*  REV 1.0.2 VMG					*/
///************************************/
exports.getHardwareResume = function getHardwareResume(idGtw, f) {
    var mySql = require('mySql');
    var connection = ug5kdb.GetDbConnection();/* mySql.createConnection({
        host: gcfg.Ulises.dbhost,
        user: gcfg.Ulises.dbuser,
        password: gcfg.Ulises.dbpassword,
        database: gcfg.Ulises.dbdatabase
    });*/
    var recursosRadio = [];
    var recursosTfno = [];

    connection.connect(function(err) {
        if (err) {
            logging.Error("Error connection to 'U5K-G' database.");
        }
        else {
            // Get keys of services
            var queryRadio = connection.query('SELECT rr.idrecurso_radio, rr.columna, rr.fila, ' +
                'rr.nombre, rr.frecuencia, rr.tipo_agente FROM recursos_radio rr WHERE rr.pasarela_id=?', idGtw,
                function(err, rows) {
                    logging.Trace(queryRadio.sql);
                    if (err) {
                        //return f(err ? err : 'NO_DATA');
                        connection.end();
                        return f({ error: err.message });
                    }
                    else {
                        recursosRadio = rows;
                        var queryTfno = connection.query('SELECT rt.idrecurso_telefono, rt.columna, rt.fila, rt.nombre, rt.tipo_interfaz_tel ' +
                            'FROM recursos_telefono rt WHERE rt.pasarela_id=?', idGtw,
                            function(err, rows) {
                                logging.Trace(queryTfno.sql);
                                if (err) {
                                    connection.end();
                                    return f({ error: err.message });
                                }
                                else {
                                    connection.end();
                                    recursosTfno = rows;
                                    return f({ radio: recursosRadio, tfno: recursosTfno });
                                }
                            });
                    }
                });
        }
    });
};


///********************************************************/
///*	FUNCTION: getHardwareByIdGateway					*/
///*	DESCRIPTION: Get gateway hardware configuration 	*/
///*  PARAMS: gtw: gatewayIp 								*/
///*			f: callback function 						*/
///********************************************************/
exports.getHardwareByIdGateway = function(idGateway, f) {
    var mySql = require('mySql');
    var connection = ug5kdb.GetDbConnectionOnTz('+02:00');/* mySql.createConnection({
        host: gcfg.Ulises.dbhost,
        user: gcfg.Ulises.dbuser,
        password: gcfg.Ulises.dbpassword,
        database: gcfg.Ulises.dbdatabase,
        timezone: '+02:00'
    });*/

    connection.connect(function(err) {
        if (err) {
            logging.Error("Error connention to 'U5K-G' database.");
        }
        else {
            var query = "";
            query = connection.query('SELECT S.*,H.CGW_idCGW,H.rank FROM SLAVES S ' +
                'LEFT JOIN hardware H ON S.idSLAVES = h.SLAVES_idSLAVES ' +
                'LEFT JOIN cgw c ON h.CGW_idCGW = c.idCGW ' +
                'WHERE c.idCGW=? ORDER BY H.rank', idGateway, function(err, rows, fields) {
                    logging.Trace(query.sql);

                    if (err) {

                        f({ error: err, hardware: null });
                    }
                    else if (rows == null || rows.length == 0) {
                        f({ error: err, hardware: null });
                    }
                    else {
                        logging.Trace(JSON.stringify(rows, null, '\t'));
                        f({ error: null, hardware: rows });
                    }
                });
            connection.end();
        }
    });
};

///****************************************************/
///*	FUNCTION: getResources 							*/
///*	DESCRIPTION: Get resources assigned to a slave	*/
///*  PARAMS: hw: slave Id							*/
///*			f: callback function 					*/
///****************************************************/
exports.getResources = function getResources(hw, slot, ipGtw, f) {

    logging.Error("(gateways).getResources " + ipGtw);
    // Crear objeto hardware
    function hardware() {
        this.AD_AGC = 0;
        this.AD_Gain = 0;
        this.DA_AGC = 0;
        this.DA_Gain = 0;
    }
    // Crear objeto parametros radio
    function radio() {
        this.TipoRadio = 0;
        this.SQ = 0;
        this.PTT = 0;
        this.BSS = false;
        this.ModoConfPTT = "0";
        this.RepSQyBSS = "0";
        this.DesactivacionSQ = "0";
        this.TimeoutPTT = "0";
        this.MetodoBSS = "0";
        this.UmbralVAD = "0";
        this.NumFlujosAudio = "0";
        this.TiempoPTT = "0";
        this.tm_ventana_rx = "0";
        this.climax_delay = 0;
        this.modo_compensacion = 0;
        this.bss_rtp = 0;
        this.tabla_indices_calidad = [];
        this.colateral = {};
    }
    // Crear objeto parametros telefonia
    function telefonia() {
        this.TipoTelefonia = 0;
        this.Lado = "0";
        this.t_eym = 0;
        this.h2h4 = "0";
        this.r_automatica = "0";
        this.no_test = "0";
        this.tm_superv = 0;
        this.uri_remota = "";
    }
    // Crear objeto resource
    function resource(num) {
        this.IdRecurso = '';
        this.Radio_o_Telefonia = 0;
        this.SlotPasarela = 0;
        this.NumDispositivoSlot = num;
        this.TamRTP = 0;
        this.Codec = 0;
        this.Uri_Local = '';
        this.Buffer_jitter = {};
        this.hardware = new hardware();
        this.radio = new radio();
        this.telefonia = new telefonia();
        this.LlamadaAutomatica = 0;
        this.restriccion = 0;
        this.listablanca = [];
        this.listanegra = [];
    }


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
            var recursos = [new resource(0), new resource(1), new resource(2), new resource(3)];

            async.each(hw,
                function(h, callback) {
                    if (h.tipo == 1) {	// Recurso radio
                        myLibResources.getResource(h.idRECURSO, function(res) {
                            myLibResources.getRadioParameters(h.idRECURSO, function(param) {
                                if (param.parametros != null) {
                                    recursos[h.P_rank].IdRecurso = res.recursos.name;
                                    recursos[h.P_rank].Radio_o_Telefonia = res.recursos.tipo;
                                    recursos[h.P_rank].SlotPasarela = slot;
                                    recursos[h.P_rank].NumDispositivoSlot = h.P_rank;
                                    recursos[h.P_rank].TamRTP = res.recursos.tamRTP;
                                    recursos[h.P_rank].Codec = res.recursos.codec;
                                    /** 20190212. Ajuste URI-LOCAL segun tipo.. */
                                    recursos[h.P_rank].Uri_Local = res.recursos.name + '@' + ipGtw;
                                    recursos[h.P_rank].Buffer_jitter.min = param.parametros.min;
                                    recursos[h.P_rank].Buffer_jitter.max = param.parametros.max;
                                    recursos[h.P_rank].hardware.AD_AGC = param.parametros.AD_AGC;
                                    recursos[h.P_rank].hardware.AD_Gain = param.parametros.AD_Gain;
                                    recursos[h.P_rank].hardware.DA_AGC = param.parametros.DA_AGC;
                                    recursos[h.P_rank].hardware.DA_Gain = param.parametros.DA_Gain;
                                    recursos[h.P_rank].radio.TipoRadio = param.parametros.tipo;
                                    recursos[h.P_rank].radio.SQ = param.parametros.sq;
                                    recursos[h.P_rank].radio.PTT = param.parametros.ptt;
                                    recursos[h.P_rank].radio.BSS = param.parametros.bss;
                                    recursos[h.P_rank].radio.ModoConfPTT = param.parametros.modoConfPtt;
                                    recursos[h.P_rank].radio.RepSQyBSS = param.parametros.repSqBss;
                                    recursos[h.P_rank].radio.DesactivacionSQ = param.parametros.desactivacionSq;
                                    recursos[h.P_rank].radio.TimeoutPTT = param.parametros.timeoutPtt;
                                    recursos[h.P_rank].radio.MetodoBSS = param.parametros.metodoBss;
                                    recursos[h.P_rank].radio.UmbralVAD = param.parametros.umbralVad;
                                    recursos[h.P_rank].radio.NumFlujosAudio = param.parametros.numFlujosAudio;
                                    recursos[h.P_rank].radio.TiempoPTT = param.parametros.tiempoPtt;
                                    recursos[h.P_rank].radio.tm_ventana_rx = param.parametros.tmVentanaRx;
                                    recursos[h.P_rank].radio.climax_delay = param.parametros.climaxDelay;
                                    recursos[h.P_rank].radio.modo_compensacion = param.parametros.modoCompensacion;
                                    recursos[h.P_rank].radio.bss_rtp = param.parametros.bssRtp;
                                }
                                callback();
                            });
                        });
                    }
                    else	// Recurso telefonía
                        myLibResources.getResource(h.idRECURSO, function(res) {
                            myLibResources.getTelephoneParameters(h.idRECURSO, function(param) {
                                if (param.parametros != null) {
                                    recursos[h.P_rank].IdRecurso = res.recursos.name;
                                    recursos[h.P_rank].Radio_o_Telefonia = res.recursos.tipo;
                                    recursos[h.P_rank].SlotPasarela = slot;
                                    recursos[h.P_rank].NumDispositivoSlot = h.P_rank;
                                    recursos[h.P_rank].TamRTP = res.recursos.tamRTP;
                                    recursos[h.P_rank].Codec = res.recursos.codec;
                                    /** 20190212. Ajuste URI-LOCAL segun tipo.. */
                                    recursos[h.P_rank].Uri_Local = res.recursos.name + '@' + ipGtw;
                                    recursos[h.P_rank].Buffer_jitter.min = param.parametros.min;
                                    recursos[h.P_rank].Buffer_jitter.max = param.parametros.max;
                                    recursos[h.P_rank].hardware.AD_AGC = param.parametros.AD_AGC;
                                    recursos[h.P_rank].hardware.AD_Gain = param.parametros.AD_Gain;
                                    recursos[h.P_rank].hardware.DA_AGC = param.parametros.DA_AGC;
                                    recursos[h.P_rank].hardware.DA_Gain = param.parametros.DA_Gain;
                                    recursos[h.P_rank].telefonia.TipoTelefonia = param.parametros.tipo;
                                    recursos[h.P_rank].telefonia.Lado = param.parametros.lado;
                                    recursos[h.P_rank].telefonia.t_eym = param.parametros.t_eym;
                                    // recursos[h.P_rank].telefonia.r_automatica = param.parametros.r_automatica;
                                    recursos[h.P_rank].telefonia.no_test = param.parametros.no_test;
                                    recursos[h.P_rank].telefonia.tm_superv = param.parametros.tm_superv;
                                    recursos[h.P_rank].telefonia.uri_remota = '';
                                }
                                callback();
                            });
                        });
                },
                function(err) {
                    connection.end();
                    f(recursos);
                }
            );
        }
    });
};

exports.uploadGWConfig = function(cfg, f) {
    var insertar = 1;
};

exports.getIpv = function getIpv(ipBound, f) {
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
            query = connection.query('SELECT DISTINCT(c.ipv),c.idCGW,c.servicio,c.name,cc.Activa FROM cgw_fisica f ' +
                'INNER JOIN cpu p ON p.ipb = f.ip ' +
                'INNER JOIN cgw c ON c.idCGW = p.CGW_idCGW ' +
                'LEFT JOIN cgw_cfg cc ON cc.CGW_idCGW = c.idCGW ' +
                'WHERE f.ip=?', ipBound, function(err, rows, fields) {
	/*				query = connection.query('SELECT DISTINCT(c.ipv),c.idCGW,c.servicio,c.name FROM cgw c ' +
										'INNER JOIN cpu p ON p.CGW_idCGW = c.idCGW ' +
										'WHERE (p.ipb=? || p.ip0=? || p.ip1=?)',[ipBound,ipBound,ipBound], function(err, rows, fields) {
	*/				logging.Trace(query.sql);

                    if (err) {
                        connection.end();
                        f({ error: err, data: null, ipv: -1 });
                    }
                    else if (rows == null || rows.length == 0) {
                        var queryCgwFisica = connection.query('SELECT * FROM cgw_fisica WHERE ip=?', ipBound, function(err, rows, fields) {
                            if (err == null && (rows == null || rows.length == 0)) {
                                var selectCgw = connection.query('SELECT c.*,p.ipb FROM cgw c ' +
                                    'INNER JOIN cpu p on p.CGW_idCGW=c.idCGW ' +
                                    'WHERE p.ipb=?', ipBound, function(err, rows, fields) {
                                        if (err == null && rows != null && rows.length > 0) {
                                            var insertCgwFisica = connection.query('INSERT INTO cgw_fisica SET cgw_idCGW=?,cgw_EMPLAZAMIENTO_idEMPLAZAMIENTO=?,ip=?', [rows[0].idCGW, rows[0].EMPLAZAMIENTO_idEMPLAZAMIENTO, ipBound], function(err, result) {
                                                connection.end();

                                                f({ error: err, toLocal: rows[0].ipv, idCGW: rows[0].idCGW, name: rows[0].name, ipv: rows[0].ipv, servicio: rows[0].servicio });
                                            });
                                        }
                                        else {
                                            //altaCgwBD(ipBound);
                                            connection.end();
                                            f({ error: err, toLocal: -1, ipv: -1 });
                                        }
                                    });
                            }
                            else {
                                connection.end();
                                f({ error: err, toLocal: -1, ipv: -1 });
                            }
                        });
                    }
                    else {
                        connection.end();

                        var valor = -1;
                        var i = 0;
                        async.each(rows,
                            function(r, callback) {
                                if (r.Activa == 1)
                                    valor = i;

                                i++;
                                callback();
                            },
                            function(error) {
                                if (valor != -1)
                                    f({ error: err, toLocal: rows[valor].ipv, idCGW: rows[valor].idCGW, name: rows[valor].name, ipv: rows[valor].ipv, servicio: rows[valor].servicio });
                                else
                                    f({ error: err, toLocal: -2, idCGW: rows[0].idCGW, name: rows[0].name, ipv: rows[0].ipv, servicio: rows[0].servicio });
                            }
                        );
                    }
                });


            //})
        }
    });
};

///************************************/
///*	FUNCTION: gatewaysBelongsActive */
///*  PARAMS: gtw,					*/
///*			f						*/
///*  REV 1.0.2 VMG					*/
///************************************/
exports.gatewaysBelongsActive = function gatewaysBelongsActive(gtw, f) {
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
            query = connection.query('SELECT COUNT(*) as cuantos ' +
                'FROM pasarelas p ' +
                'LEFT JOIN emplazamientos e ON p.emplazamiento_id=e.idemplazamiento ' +
                'LEFT JOIN configuraciones c ON e.configuracion_id=c.idconfiguracion ' +
                'WHERE p.idpasarela=? ' +
                'AND c.activa=1', gtw, function(err, rows, fields) {
                    logging.Trace(query.sql);

                    connection.end();
                    if (err) {
                        f({ error: err, data: false });
                    }
                    else if (rows == null || rows.length == 0) {
                        f({ error: err, data: false });
                    }
                    else {
                        f({ error: err, data: rows[0].cuantos > 0 });
                    }
                });
        }
    });
};

exports.getGatewaysBelongsActive = function getGatewaysBelongsActive(f) {
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
            query = connection.query('SELECT cgw.*,w.wport,e.idEMPLAZAMIENTO,e.name AS site,c.idCFG,c.name AS cfg,c.description,c.activa,c.ts_activa FROM cgw_estado ce ' +
                'INNER JOIN cgw cgw ON cgw.idCGW=ce.cgw_idCGW ' +
                'INNER JOIN emplazamiento e ON e.idEMPLAZAMIENTO = ce.cgw_EMPLAZAMIENTO_idEMPLAZAMIENTO ' +
                'INNER JOIN cfg c ON c.idCFG = e.cfg_idCFG ' +
                'INNER JOIN servicios s ON s.idSERVICIOS=cgw.servicio ' +
                'INNER JOIN web w on w.idWEB=s.WEB_idWEB ' +
                'WHERE ce.viva=1 ORDER BY cfg,site', function(err, rows, fields) {
                    logging.Trace(query.sql);

                    connection.end();
                    if (err) {
                        f({ error: err, data: null });
                    }
                    else if (rows == null || rows.length == 0) {
                        f({ error: err, data: null });
                    }
                    else {
                        f({ error: err, data: rows });
                    }
                });
        }
    });
};

exports.getGatewaysAlive = function getGatewaysAlive(f) {
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
            query = connection.query('SELECT * FROM alivegateways_view', function(err, rows, fields) {
                logging.Trace(query.sql);

                connection.end();
                if (err) {
                    f({ error: err, data: null });
                }
                else if (rows == null || rows.length == 0) {
                    f({ error: err, data: null });
                }
                else {
                    f({ error: err, data: rows });
                }
            });
        }
    });
};

exports.sinchroGateways = function sinchroGateways(idGtw) {
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
            var queryCgwCfg = connection.query('UPDATE CGW_CFG SET Sincro=1 WHERE Activa<>0 AND Sincro=0 AND' +
                ' CGW_idCGW=?', idGtw, function(err, result) {
                    connection.end();
                    logging.Trace(queryCgwCfg.sql);
                });
        }
    });
};

exports.setLastUpdateToGateway = function setLastUpdateToGateway(idConf, fechaHora, gateway, f) {
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
            var query = connection.query('SELECT idCFG,activa FROM cfg WHERE name=?', idConf, function(err, rows, fields) {
                if (err) {
                    logging.Trace(query.sql);
                    f(false);
                }
                else if (rows.length > 0) {	// && rows[0].activa == 1){
                    async.waterfall([
                        function(callback) {
                            exports.getIpv(gateway, function(result) {
                                if (result.error != null)
                                    return callback(result.error);

                                callback(null, result.idCGW);
                            });
                        }],
                        function(error, idCgw) {
                            var queryCgwCfg = connection.query('UPDATE CGW_CFG SET LastUpdate=? WHERE CFG_idCFG=? AND CGW_idCGW=?', [fechaHora, rows[0].idCFG, idCgw], function(err, result) {
                                connection.end();
                                logging.Trace(queryCgwCfg.sql);
                                if (err) {
                                    return f(false);
                                }

                                f(true);
                            });
                        }
                    );
                }
                else {
                    connection.end();
                    f(false);
                }
            });
        }
    });
};

exports.updateSite = function(idGateway, idSite, f) {
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
            var query = connection.query('UPDATE cgw SET EMPLAZAMIENTO_idEMPLAZAMIENTO=? WHERE idCGW=?', [idSite, idGateway], function(err, result) {
                connection.end();
                logging.Trace(query.sql);
                if (err) {
                    return f(false);
                }

                f(true);
            });
        }
    });
};

exports.getGatewaysToOperator = function(idOperator, f) {
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
            query = connection.query('SELECT cgw_idCGW FROM op_gtw ' +
                'WHERE operadores_idOPERADORES=?', idOperator, function(err, rows, fields) {
                    logging.Trace(query.sql);

                    connection.end();
                    if (err) {
                        f({ error: err, data: null });
                    }
                    else if (rows == null || rows.length == 0) {
                        f({ error: err, data: null });
                    }
                    else {
                        f({ error: err, data: rows });
                    }
                });
        }
    });
};

exports.getGatewaysNamesInConfig = function(ip, idCfg, idUpdatedCgw, f) {
    var mySql = require('mySql');
    var connection = ug5kdb.GetDbConnection();/* mySql.createConnection({
        host: gcfg.Ulises.dbhost,
        user: gcfg.Ulises.dbuser,
        password: gcfg.Ulises.dbpassword,
        database: gcfg.Ulises.dbdatabase
    });*/

    if (idUpdatedCgw == 'noData')
        idUpdatedCgw = '-1';

    connection.connect(function(err, usrs) {
        if (err) {
            logging.Error("Error connection to 'U5K-G' database.");
        }
        else {
            query = connection.query(
                'SELECT p.nombre as nombre ' +
                'FROM pasarelas p ' +
                'LEFT JOIN emplazamientos e ON p.emplazamiento_id=e.idemplazamiento ' +
                'LEFT JOIN configuraciones c ON e.configuracion_id=c.idconfiguracion ' +
                'WHERE c.idconfiguracion=? AND p.idpasarela<>? ', [idCfg, idUpdatedCgw], function(err, rows, fields) {
                    logging.Trace(query.sql);

                    connection.end();
                    if (err) {
                        f({ error: err, data: null });
                    }
                    else if (rows == null) {
                        f({ error: err, data: null });
                    }
                    else {
                        var dupName = false;
                        for (var i = 0; i < rows.length; i++) {
                            if (ip == rows[i].nombre) {
                                dupName = true;
                                break;
                            }
                        }
                        if (dupName)
                            f({ error: "NAME_DUP", data: rows });
                        else
                            f({ error: "NO_ERROR", data: rows });
                    }
                });
        }
    });
};

exports.getGatewaysIpInConfig = function(ip, idCfg, idUpdatedCgw, f) {
    var mySql = require('mySql');
    var connection = ug5kdb.GetDbConnection();/* mySql.createConnection({
        host: gcfg.Ulises.dbhost,
        user: gcfg.Ulises.dbuser,
        password: gcfg.Ulises.dbpassword,
        database: gcfg.Ulises.dbdatabase
    });*/

    if (idUpdatedCgw == 'noData')
        idUpdatedCgw = '-1';

    connection.connect(function(err, usrs) {
        if (err) {
            logging.Error("Error connection to 'U5K-G' database.");
        }
        else {
            query = connection.query('SELECT p.ip_virtual as ip ' +
                'FROM pasarelas p ' +
                'LEFT JOIN emplazamientos e ON p.emplazamiento_id=e.idemplazamiento ' +
                'LEFT JOIN configuraciones c ON e.configuracion_id=c.idconfiguracion ' +
                'WHERE c.idconfiguracion=? AND p.idpasarela<>? ' +
                'UNION ' +
                'SELECT p.ip_cpu0 as ip ' +
                'FROM pasarelas p ' +
                'LEFT JOIN emplazamientos e ON p.emplazamiento_id=e.idemplazamiento ' +
                'LEFT JOIN configuraciones c ON e.configuracion_id=c.idconfiguracion ' +
                'WHERE c.idconfiguracion=? AND p.idpasarela<>? ' +
                'UNION ' +
                'SELECT p.ip_cpu1 as ip ' +
                'FROM pasarelas p ' +
                'LEFT JOIN emplazamientos e ON p.emplazamiento_id=e.idemplazamiento ' +
                'LEFT JOIN configuraciones c ON e.configuracion_id=c.idconfiguracion ' +
                'WHERE c.idconfiguracion=? AND p.idpasarela<>?', [idCfg, idUpdatedCgw, idCfg, idUpdatedCgw, idCfg, idUpdatedCgw], function(err, rows, fields) {
                    logging.Trace(query.sql);

                    connection.end();
                    if (err) {
                        f({ error: err, data: null });
                    }
                    else if (rows == null) {
                        f({ error: err, data: null });
                    }
                    else {
                        var dupIp = false;
                        for (var i = 0; i < rows.length; i++) {
                            if (ip == rows[i].ip) {
                                dupIp = true;
                                break;
                            }
                        }
                        if (dupIp)
                            f({ error: "IP_DUP", data: rows });
                        else
                            f({ error: "NO_ERROR", data: rows });
                    }
                });
        }
    });
};

/**
 * 20190215. 
 * Obtiene el numero de Pasarelas pendientes de actualizar en la configuracion activa
 * @param {any} f
 */
exports.getGatewaysPendings = async function(cb) {
    var mySql = require('mySql');
    var connection = ug5kdb.GetDbConnection();

    var strQuery = 'SELECT COUNT(*) AS activas FROM pasarelas WHERE pendiente_actualizar=1;';
    var res = await ug5kdb.QuerySync(strQuery);
    var count = res.error ? 0 : res.data[0] ? res.data[0].activas : 0;
    cb(count);
};

//////////////////////////////////////////////////////////////////
// FUNCTION: copyResources
// DESCRIPTION: Copia los recursos de una slave en la pos destino
// 				de la slave destino
//////////////////////////////////////////////////////////////////
exports.copyResources = function(idSlave, posTargetId, f) {
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
            var query = connection.query('SELECT r.*,rank FROM recurso r ' +
                'INNER JOIN pos p ON p.idPOS = r.POS_idPOS ' +
                'WHERE p.SLAVES_idSLAVES=? ' +
                'ORDER BY rank', idSlave, function(err, rows, fields) {
                    logging.Trace(query.sql);

                    if (err) {
                        connection.end();
                        f({ error: err, data: null });
                    }
                    else if (rows == null || rows.length == 0) {
                        // Si no existen recursos no hay nada que copiar
                        connection.end();
                        f({ error: err, data: null });
                    }
                    else {
                        async.each(rows,
                            function(r, callback) {
                                var numreg = rows.length;
                                var queryPos = connection.query('INSERT INTO pos (SLAVES_idSLAVES,rank) VALUES (?,?)', [posTargetId, r.rank], function(err, resultPos) {
                                    var queryCopy = connection.query('INSERT INTO recurso (POS_idPOS,name,tamRTP,codec,tipo,enableRegistro,restriccion,szClave,LlamadaAutomatica) VALUES ' +
                                        '(?,?,?,?,?,?,?,?,?)', [resultPos.insertId, r.name, r.tamRTP, r.codec, r.tipo, r.enableRegistro, r.restriccion, r.szClave, r.LlamadaAutomatica],
                                        function(err, result) {
                                            logging.Trace(queryCopy.sql);


                                            if (r.tipo == 1) { //si es un recurso radio mirar si tiene tabla de audio y asignarsela
                                                var queryTablaAudio = connection.query('SELECT t.* FROM tabla_bss_recurso t WHERE recurso_idRECURSO=?', r.idRECURSO, function(err, rows1, fields) {
                                                    if (err) {
                                                        return callback(null, err);
                                                    }
                                                    logging.Trace(queryTablaAudio.sql);
                                                    if (rows1.length > 0) {
                                                        var queryInsertTablaAudio = connection.query('INSERT INTO tabla_bss_recurso (recurso_idRECURSO,tabla_bss_idtabla_bss) VALUES  (?,?)', [result.insertId, rows1[0].tabla_bss_idtabla_bss],
                                                            function(err, resutl) {
                                                                logging.Trace(queryInsertTablaAudio.sql);
                                                            });

                                                    }
                                                });
                                            }

                                            CopyParamResources(connection, r.idRECURSO, result.insertId, function() {
                                                callback();
                                            });
                                        }
                                    );
                                });
                            },
                            function(error) {
                                connection.end();
                                f({ error: error });
                            }
                        );
                    }
                });
        }
    });
};

///***********************************************************************/
///****** 	PRIVATE FUNCTIONS  *****************************************/
///***********************************************************************/
function updateCgw(connection, gtw, callback) {
    var mySql = require('mySql');

    connection = ug5kdb.GetDbConnection();/* mySql.createConnection({
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
            if (gtw.hasOwnProperty("acGrupoMulticast"))
                delete gtw.acGrupoMulticast;
            if (gtw.hasOwnProperty("uiPuertoMulticast"))
                delete gtw.uiPuertoMulticast;
            var query = connection.query('UPDATE CGW SET name=?, ipv=? WHERE idCGW=?', [gtw.name, gtw.ipv, gtw.idCGW], function(err, result) {
                if (err) return callback(err);

                logging.Trace(query.sql);
                callback(null);
            });
        }
    });
}

function updateCpus(connection, gtw, cpus, callback) {
    async.waterfall([
        function(callback) {
            var idCGW = { 'CGW_idCGW': gtw.idCGW };
            if (gtw.idCGW != null) {
                var query = connection.query('DELETE FROM CPU WHERE ?', idCGW, function(err, result) {
                    if (err)
                        return callback(null, err);

                    logging.Trace(query.sql);
                    callback(null, idCGW);
                });
            }
            else
                callback(null, idCGW);
        },
        function(idCgw, callback) {
            async.parallel([
                function(callback) {
                    cpus[0].num = 1;
                    var query = connection.query('INSERT INTO CPU SET ?,?', [idCgw, cpus[0]], function(err, resul) {
                        if (err) {
                            logging.Error("ERROR: " + query.sql);
                            return callback(err);
                        }

                        logging.Trace(query.sql);
                        callback();
                    });
                },
                function(callback) {
                    if (cpus.length == 2) {
                        cpus[0].num = 2;
                        var query = connection.query('INSERT INTO CPU SET ?,?', [idCgw, cpus[1]], function(err, resul) {
                            if (err) {
                                logging.Error("ERROR: " + query.sql);
                                return callback(err);
                            }
                            logging.Trace(query.sql);
                            callback();
                        });
                    }
                    else
                        callback();
                }], function(err) {
                    callback(err);
                });
        }], function(err) {
            callback(err);
        });
}

function updateService(connection, gtw, serviceId, callback) {
    var query = connection.query('UPDATE CGW SET servicio=? WHERE ??=?', [serviceId, 'idCGW', gtw], function(err, result) {
        if (err) return callback({ error: err, data: null });

        logging.Trace(query.sql);
        callback({ error: null, data: result.affectedRows });
    });
}

function getEmplazamiento(name, confName, f) {
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
            var query = connection.query('SELECT e.idEMPLAZAMIENTO,c.idCFG,c.activa FROM emplazamiento e ' +
                'INNER JOIN cfg c ON c.idCFG=e.cfg_idCFG ' +
                'WHERE e.name=? AND c.name=?', [name, confName], function(err, rows, fields) {
                    logging.Trace(query.sql);

                    if (err) {
                        connection.end();
                        f({ error: err, data: null });
                    }
                    else if (rows == null || rows.length == 0) {
                        // Si no existe lo creo...
                        // Pero antes hay que comprobar si existe la configuración,
                        // porque si no existe, hay que crearla
                        var qSelectCfg = connection.query('SELECT idCFG,activa FROM CFG WHERE name=?', confName, function(err, rows, fields) {
                            if (err == null && rows != null && rows.length > 0) {
                                var queryInsert = connection.query('INSERT INTO emplazamiento SET cfg_idCFG=?,name=?', [rows[0].idCFG, name], function(err, result) {
                                    connection.end();
                                    f({ error: err, data: { idCFG: rows[0].idCFG, idEMPLAZAMIENTO: result.insertId, Activa: rows[0].activa } });
                                });
                            }
                            else if (rows == null || rows.length == 0) {
                                var queryInsertCfg = connection.query('INSERT INTO cfg SET name=?', confName, function(err, result) {
                                    var queryInsertSite = connection.query('INSERT INTO emplazamiento SET cfg_idCFG=?,name=?', [result.insertId, name], function(err, resultSite) {
                                        connection.end();
                                        f({ error: err, data: { idCFG: result.insertId, idEMPLAZAMIENTO: resultSite.insertId, Activa: 0 } });
                                    });
                                });
                            }
                        });
                    }
                    else {
                        connection.end();
                        f({ error: err, data: { idCFG: rows[0].idCFG, idEMPLAZAMIENTO: rows[0].idEMPLAZAMIENTO, Activa: rows[0].activa } });
                    }
                });
        }
    });
}

function CopyParamResources(connection, sourceResourceId, targetResourceId, f) {
    async.parallel({
        ubicaciones: function(callback) {
            var query = connection.query('INSERT INTO ubicaciones (RECURSO_idRECURSO,uriTxA,uriTxB,uriRxA,uriRxB,activoTx,activoRx) ' +
                'SELECT ?,uriTxA,uriTxB,uriRxA,uriRxB,activoTx,activoRx FROM ubicaciones WHERE RECURSO_idRECURSO=?', [targetResourceId, sourceResourceId], function(err, result) {
                    logging.Trace(query.sql);
                    if (err) return callback(err);
                    callback(err, result.insertId);
                });
        },
        jitter: function(callback) {
            var query = connection.query('INSERT INTO jitter (RECURSO_idRECURSO,min,max) ' +
                'SELECT ?,min,max FROM jitter WHERE RECURSO_idRECURSO=?', [targetResourceId, sourceResourceId], function(err, result) {
                    logging.Trace(query.sql);
                    if (err) return callback(err);
                    callback(err, result.insertId);
                });
        },
        listas: function(callback) {
            var query = connection.query('INSERT INTO listanegra (RECURSO_idRECURSO,URILISTAS_idURILISTAS) ' +
                'SELECT ?,URILISTAS_idURILISTAS FROM listanegra WHERE RECURSO_idRECURSO=?', [targetResourceId, sourceResourceId], function(err, result) {
                    logging.Trace(query.sql);
                    query = connection.query('INSERT INTO listablanca (RECURSO_idRECURSO,URILISTAS_idURILISTAS) ' +
                        'SELECT ?,URILISTAS_idURILISTAS FROM listablanca WHERE RECURSO_idRECURSO=?', [targetResourceId, sourceResourceId], function(err, result) {
                            logging.Trace(query.sql);
                            if (err) return callback(err);
                            callback(err, result.insertId);
                        });
                });
        },
        paramhw: function(callback) {
            var query = connection.query('INSERT INTO paramhw (RECURSO_idRECURSO,AD_AGC,AD_Gain,DA_AGC,DA_Gain) ' +
                'SELECT ?,AD_AGC,AD_Gain,DA_AGC,DA_Gain FROM paramhw WHERE RECURSO_idRECURSO=?', [targetResourceId, sourceResourceId], function(err, result) {
                    logging.Trace(query.sql);
                    if (err) return callback(err);
                    callback(err, result.insertId);
                });
        },
        paramtel: function(callback) {
            var query = connection.query('INSERT INTO paramtelef (RECURSO_idRECURSO,tipo,lado,t_eym,h2h4,ladoeym,modo,r_automatica,no_test_local,no_test_remoto,it_release,uri_remota,detect_vox,umbral_vox,tm_inactividad,superv_options,tm_superv_options,colateral_scv,iT_Int_Warning) ' +
                'SELECT ?,tipo,lado,t_eym,h2h4,ladoeym,modo,r_automatica,no_test_local,no_test_remoto,it_release,uri_remota,detect_vox,umbral_vox,tm_inactividad,superv_options,tm_superv_options,colateral_scv,iT_Int_Warning FROM paramtelef WHERE RECURSO_idRECURSO=?', [targetResourceId, sourceResourceId], function(err, result) {
                    logging.Trace(query.sql);

                    query = connection.query('INSERT INTO rangos (PARAMTELEF_idPARAMTELEF,origen,inicial,final) ' +
                        'SELECT ?,r.origen,r.inicial,r.final FROM rangos r ' +
                        'INNER JOIN paramtelef pt ON pt.idPARAMTELEF=r.PARAMTELEF_idPARAMTELEF ' +
                        'WHERE pt.RECURSO_idRECURSO=?', [result.insertId, sourceResourceId], function(err, result) {
                            if (err) return callback(err);
                            callback(err, result.insertId);
                        });
                });
        },
        paramradio: function(callback) {
            var query = connection.query('INSERT INTO paramradio (RECURSO_idRECURSO,tipo,sq,ptt,bss,modoConfPtt,repSqBss,desactivacionSq,timeoutPtt,metodoBss,umbralVad,numFlujosAudio,tiempoPtt,tmVentanaRx,climaxDelay,tmRetardoFijo,bssRtp,retrasoSqOff,evtPTT,tjbd,tGRSid,iEnableGI,iPttPrio,iSesionPrio,iPrecisionAudio) ' +
                'SELECT ?,tipo,sq,ptt,bss,modoConfPtt,repSqBss,desactivacionSq,timeoutPtt,metodoBss,umbralVad,numFlujosAudio,tiempoPtt,tmVentanaRx,climaxDelay,tmRetardoFijo,bssRtp,retrasoSqOff,evtPTT,tjbd,tGRSid,iEnableGI,iPttPrio,iSesionPrio,iPrecisionAudio FROM paramradio WHERE RECURSO_idRECURSO=?', [targetResourceId, sourceResourceId], function(err, result) {
                    logging.Trace(query.sql);
                    if (err) return callback(err);
                    callback(err, result.insertId);
                });
        },
        colateral: function(callback) {
            var query = connection.query('INSERT INTO colateral (DESTINOS_idDESTINOS,RECURSO_idRECURSO) ' +
                'SELECT DESTINOS_idDESTINOS,? FROM colateral WHERE RECURSO_idRECURSO=?', [targetResourceId, sourceResourceId], function(err, result) {
                    logging.Trace(query.sql);
                    if (err) return callback(err);
                    callback(err, result.insertId);
                });
        }
    }, function(err, results) {
        f();
    }
    );
}

function deleteResources4Gateway(gtwBorrar, f) {
    var mySql = require('mySql');
    var connection = ug5kdb.GetDbConnection();/* mySql.createConnection({
        host: gcfg.Ulises.dbhost,
        user: gcfg.Ulises.dbuser,
        password: gcfg.Ulises.dbpassword,
        database: gcfg.Ulises.dbdatabase,
        multipleStatements: true
    });*/

    var idSlaves = [-1, -1, -1, -1];
    var idResources = [];
    var idDestinies = [];
    connection.connect(function(err, usrs) {
        if (err) {
            logging.Error("Error connection to 'U5K-G' database.");
        }
        else {

            var selectIdsResourcesFromGtw = function /*selectIdsResourcesFromGtw*/(callback) {
                var query = connection.query(
                    'SELECT h.SLAVES_idSLAVES, r.idRECURSO, d.idDESTINOS ' +
                    'FROM hardware h ' +
                    'LEFT JOIN slaves s ON h.SLAVES_idSLAVES = s.idSLAVES ' +
                    'LEFT JOIN pos p ON s.idSLAVES = p.SLAVES_idSLAVES ' +
                    'LEFT JOIN recurso r ON p.idPOS = r.POS_idPOS ' +
                    'LEFT JOIN paramradio pr ON r.idRECURSO = pr.RECURSO_idRECURSO ' +
                    'LEFT JOIN paramtelef pt ON r.idRECURSO = pt.RECURSO_idRECURSO ' +
                    'LEFT JOIN colateral c ON r.idRECURSO = c.RECURSO_idRECURSO ' +
                    'LEFT JOIN destinos d ON c.DESTINOS_idDESTINOS = d.idDESTINOS ' +
                    'WHERE h.CGW_idCGW = ? ', gtwBorrar.idPasarela,
                    function(err, rows) {
                        logging.Trace(query.sql);
                        if (err) {
                            connection.end();
                            return callback(null, "ERROR");
                        }
                        else {

                            var insertElement = true;
                            var i, j, k = 0;
                            for (i = 0; i < rows.length; i++) {
                                //Save idSlaves
                                for (j = 0; j < 4; j++) {
                                    if (idSlaves[j] == rows[i].SLAVES_idSLAVES) {
                                        insertElement = false;
                                        break;
                                    }
                                }
                                if (insertElement) {
                                    idSlaves[k] = rows[i].SLAVES_idSLAVES;
                                    k++;
                                }
                                else
                                    insertElement = true;

                                //Save idRecursos
                                if (rows[i].idRECURSO != null)
                                    idResources.push(rows[i].idRECURSO);

                                //Save idDestinos
                                if (rows[i].idDESTINOS != null)
                                    idDestinies.push(rows[i].idDESTINOS);
                            }
                            gtwBorrar.idSlaves = idSlaves;
                            gtwBorrar.idResources = idResources;
                            gtwBorrar.idDestinies = idDestinies;

                            return callback(null, gtwBorrar);
                        }
                    });
            };
            var deleteSlavesFromGtw = function /*deleteSlavesFromGtw*/(gtwBorrar, callback) {
                var queries = '';
                if (typeof gtwBorrar.idSlaves != 'undefined') {
                    gtwBorrar.idSlaves.forEach(function(item) {
                        queries += mySql.format('DELETE FROM slaves WHERE idSLAVES = ? ;',
                            [item]);
                    });
                    connection.query(queries, function(err, results) {
                        if (err) {
                            connection.end();
                            return callback(null, "ERROR");
                        }
                        else {
                            return callback(null, gtwBorrar);
                        }
                    });
                }
                else
                    return callback(null, gtwBorrar);
            };
            var deleteDestiniesFromGtw = function /*deleteDestiniesFromGtw*/(gtwBorrar, callback) {
                var queries = '';
                if (typeof gtwBorrar.idDestinies != 'undefined') {
                    gtwBorrar.idDestinies.forEach(function(item) {
                        queries += mySql.format('DELETE FROM destinos WHERE idDESTINOS = ? ;',
                            [item]);
                    });
                    connection.query(queries, function(err, results) {
                        if (err) {
                            connection.end();
                            return callback(null, "ERROR");
                        }
                        else {
                            return callback(null, "DEL_RESOURCES_OK");
                        }
                    });
                }
            };

            async.waterfall([
                selectIdsResourcesFromGtw,
                deleteSlavesFromGtw,
                deleteDestiniesFromGtw
            ], function(err, result) {
                f({ data: result });
            });

        }
    });
}

function getFormattedIps(gtw) {
    var lista_ips = [];
    var ip2insert = {};
    var i = 0;
    var charIndex = 0;
    for (i = 0; i < gtw.proxys.length; i++) {
        ip2insert.ip = gtw.proxys[i].ip;
        ip2insert.tipo = 'PRX';
        lista_ips.push(ip2insert);
        ip2insert = {};
    }
    for (i = 0; i < gtw.registrars.length; i++) {
        ip2insert.ip = gtw.registrars[i].ip;
        ip2insert.tipo = 'REG';
        lista_ips.push(ip2insert);
        ip2insert = {};
    }
    for (i = 0; i < gtw.listServers.length; i++) {
        ip2insert.ip = gtw.listServers[i].ip;
        ip2insert.tipo = 'NTP';
        lista_ips.push(ip2insert);
        ip2insert = {};
    }
    for (i = 0; i < gtw.traps.length; i++) {
        ip2insert.ip = gtw.traps[i];
        if (gtw.traps[i].substring(0, 1) == '1')
            ip2insert.tipo = 'TRPV1';
        else
            ip2insert.tipo = 'TRPV2';
        lista_ips.push(ip2insert);
        ip2insert = {};
    }

    return lista_ips;
}