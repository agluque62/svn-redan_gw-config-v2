var express = require('express');
var logging = require('../../lib/nu-log.js');

var router = express.Router();

var bodyParser = require('body-parser');
var parseUrlEncoded = bodyParser.urlencoded({ extended: false });

var myLibGateways = require('../../lib/gateways.js');
var myLibServicesGateways = require('../../lib/services.js');
var myLibHardware = require('../../lib/hardware.js');

var async = require('async');
var gcfg = require('../../configUlises.json');

// Middleware Resources
//var myGatewaysModule = require('./resources.js');

// Nest routers by attaching them as middleware:
//router.use('/:gatewayId/resources', myGatewaysModule);

router.route('/updateUsers')
    .get(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        myLibGateways.updateUsers(function(data) {
            res.json(data);
        });
    });
router.route('/updateTable/:idTable')
    .get(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        myLibGateways.updateTable(req.params.idTable, function(data) {
            res.json(data);
        });
    });
router.route('/syncGateways/:refreshTime')
    .get(function(req, res) {
        var aliveGtws = req.app.get('aliveGtws');
        //updateAliveGtws(aliveGtws, req.params.refreshTime);
        res.json(aliveGtws);
    });
router.route('/availableservices')
    .get(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        myLibGateways.getSiteName4ServiceCopy(function(result) {
            res.json(result);
        });
    });
router.route('/getServiceData/:idSourceCgw')
    .get(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        myLibGateways.getServiceDataFromGtw(req.params.idSourceCgw, function(result) {
            res.json(result);
        });
    });
router.route('/getServiceDataListaIps/:idSourceCgw')
    .get(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        myLibGateways.getServiceDataListaIpsFromGtw(req.params.idSourceCgw, function(result) {
            res.json(result);
        });
    });
router.route('/')	// The root path is relative the path where it's mounted in app.js (app.use('/gateways', gateways);)
    .get(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        myLibGateways.getGateways(req, res);
    });

router.route('/checkipaddr/:ip/:idCfg/:idUpdatedCgw')
    .get(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        myLibGateways.getGatewaysIpInConfig(req.params.ip, req.params.idCfg, req.params.idUpdatedCgw, function(gtw) {
            res.json(gtw.error);
        });
    });

router.route('/checkgtwname/:name/:idCfg/:idUpdatedCgw')
    .get(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        myLibGateways.getGatewaysNamesInConfig(req.params.name, req.params.idCfg, req.params.idUpdatedCgw, function(gtw) {
            res.json(gtw.error);
        });
    });

router.route('/checkipaddr4changesite/:ipb1/:ipb2/:idEmp')
    .get(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        myLibGateways.getGatewaysIp4ChangeSite(req.params.ipb1, req.params.ipb2, req.params.idEmp,
            function(gtw) {
                res.json(gtw.error);
            }
        );
    });

router.route('/activeCfg')
    .get(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        myLibGateways.getGatewaysBelongsActive(function(gtw) {
            res.json(gtw.data);
        });
    });

router.route('/alive')
    .get(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        myLibGateways.getGatewaysAlive(function(gtw) {
            res.json(gtw.data);
        });
    });

router.route('/activeCfg/:gtw')
    .get(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        myLibGateways.gatewaysBelongsActive(req.params.gtw, function(gtw) {
            res.json(gtw.data);
        });
    });

router.route('/changesite/:gateway/:idOldSite/:idNewSite')
    .post(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        myLibGateways.changeGateWaySite(req.params.gateway, req.params.idOldSite, req.params.idNewSite, function(result) {
            res.json(result);
        });
    });

router.route('/operator/:idOperator')
    .get(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        myLibGateways.getGatewaysToOperator(req.params.idOperator, function(gtw) {
            res.json(gtw.data);
        });
    });

router.route('/iplist/:idGtw')
    .get(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        myLibGateways.getIpList4Gateway(req.params.idGtw, function(result) {
            res.json(result);
        });
    });

router.route('/:sourceIdGateway/:targetNameGateway/:ip0TargetGateway/:ip1TargetGateway/:ipvTargetGateway')
    .copy(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        var sourceIdGateway = req.params.sourceIdGateway;
        var targetNameGateway = req.params.targetNameGateway;
        var ip0TargetGateway = req.params.ip0TargetGateway;
        var ip1TargetGateway = req.params.ip1TargetGateway;
        var ipvTargetGateway = req.params.ipvTargetGateway;

        myLibGateways.checkGatewayNameIp(sourceIdGateway, targetNameGateway, ip0TargetGateway, ip1TargetGateway,
            function(result) {
                if (result.error != null) {
                    res.json(result);
                }
                else {
                    myLibGateways.copyGateway(sourceIdGateway, targetNameGateway,
                        ip0TargetGateway, ip1TargetGateway, ipvTargetGateway,
                        function(result) {
                            res.json(result);
                        });
                }
            });
    });

router.route('/:gateway')
    .post(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        var newGateway = req.body.general;
        var service = req.body.servicios;
        //myLibGateways.gatewayExists(req.body.idConf,newGateway,function(result){
        //	if (result.error == 'ER_DUP_ENTRY')
        //		res.json(result);
        //	else{
        myLibGateways.postGateway(req.body.idConf, true, true, newGateway, service, function(result) {
            res.json(result);
            //});
            //}
        });
    })
    .get(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        var gtw = req.params.gateway;
        if (req.params.gateway == 'null') {
            res.render('./services/postGateway');
        }
        else
            myLibGateways.getGateway(req, res, null, gtw, function(gtw) {
                res.json({ general: gtw });
            });
    })
    .delete(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        var gtw = req.params.gateway;
        myLibGateways.delGateway(req, res, gtw);
    })
    .put(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        var gtw = req.body.general;
        var service = req.body.servicios;
        myLibGateways.putGateway(req, res, gtw, service, function(gtw) {
            res.status(201).json(gtw);
        });
    })
    .copy(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        myLibGateways.CloneGateway(req.params.gateway, req.body, function(result) {
            res.json(result);
        });
    });

/********************************/
/*  Routes relating to services */
/********************************/
router.route('/:gateway/services')
    .get(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        myLibGateways.getGateway(req, res, null, req.params.gateway, function(gtw) {
            myLibServicesGateways.getServices(req.params.gateway, null, function(data) {
                res.json({
                    general: gtw,
                    servicios: data.services
                });
            });
        });
    });
router.route('/:gateway/services/:service')
    .put(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        myLibGateways.setService(req.params.gateway, req.params.service, function(result) {
            res.json(result);
        });
    });


/*************************************************/
/*  Routes relating to test active configuration */
/*************************************************/
////*  REV 1.0.2 VMG
router.route('/:gateway/testconfig')
    .get(function(req, res) {
        var aliveGtws = req.app.get('aliveGtws');
        logging.Info(req.method, req.originalUrl);
        //myLibGateways.getIpv(req.params.gateway,function(result){
        myLibGateways.getIpv2(req.params.gateway, function(result) {
            if (result.toLocal == -1) {
                // No en BD
                // logging.Error(JSON.stringify({ idConf: result.ipv.toString(), fechaHora: '' }, null, '\t'));
                // 20190508. Debe retornar "-1"
                res.json({ idConf: /*result.ipv.toString()*/'-1', fechaHora: '' });
            }
            else {
                if (result.data.length == 1) {//La pasarela está en una sola config
                    if (result.data[0].activa == 1) {
                        if (req.query.std == "-4")
                            updateSincGtws(aliveGtws, req.params.gateway, result.data[0].idGtw, result.data[0].updatePend, result.data[0].idconfiguracion, false, true);
                        else
                            updateSincGtws(aliveGtws, req.params.gateway, result.data[0].idGtw, result.data[0].updatePend, result.data[0].idconfiguracion, false, false);
                        res.json({ idConf: result.data[0].idConf, fechaHora: result.data[0].fechaHora });
                    }
                    else {//No Activa
                        updateSincGtws(aliveGtws, req.params.gateway, result.data[0].idGtw, 0, result.data[0].idconfiguracion, true, false);
                        // No en configurción activa
                        // logging.Error(JSON.stringify({ idConf: result.toLocal.toString(), fechaHora: '' }, null, '\t'));
                        // myLibGateways.getTestConfig(result.ipv,function(data){
                        // 20190508. Debe retornar "-2"
                        res.json({ idConf: /*-2*/'-2', fechaHora: '' });
                    }
                }
                else {//La pasarela está en varias configuraciones
                    var id2Send = '';
                    var date2Send = '';
                    var isActiveCfg = false;
                    for (var i = 0; i < result.data.length; i++) {
                        if (result.data[i].activa == 1) {
                            id2Send = result.data[i].idConf;
                            date2Send = result.data[i].fechaHora;
                        }
                        if (result.data[i].activa == 1) {
                            isActiveCfg = true;
                            if (req.query.std == "-4")
                                updateSincGtws(aliveGtws, req.params.gateway, result.data[i].idGtw, result.data[i].updatePend, result.data[i].idconfiguracion, false, true);
                            else
                                updateSincGtws(aliveGtws, req.params.gateway, result.data[i].idGtw, result.data[i].updatePend, result.data[i].idconfiguracion, false, false);

                        }
                        else {
                            if (req.query.std == "-4")
                                updateSincGtws(aliveGtws, req.params.gateway, result.data[i].idGtw, result.data[i].updatePend, result.data[i].idconfiguracion, true, true);
                            else
                                updateSincGtws(aliveGtws, req.params.gateway, result.data[i].idGtw, result.data[i].updatePend, result.data[i].idconfiguracion, true, false);

                        }
                    }
                    if (isActiveCfg)
                        res.json({ idConf: id2Send, fechaHora: date2Send });
                    else {
                        // 20190508. Debe retornar "-1"                            
                        res.json({ idConf: /*-2*/'-2', fechaHora: date2Send });                        
                    }
                }
            }
        });
    });

router.route('/syncGateways')
    .get(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        var aliveGtws = req.app.get('aliveGtws');
        res.json(aliveGtws);
    });

router.route('/createNewGateway/:newGateway/:idSite')
    .post(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        var newGateway = req.body.newGateway;
        var idSite = req.body.idSite;
        myLibGateways.createGateWayonSite(newGateway, idSite, function(result) {
            res.json(result);
        });
    });
router.route('/updateGateway/:newGateway/:idGtw')
    .post(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        var newGateway = req.body.newGateway;
        var idGtw = req.body.idGtw;
        myLibGateways.updateGateWayonSite(newGateway, idGtw, function(result) {
            res.json(result);
        });
    });
//////////////////
//Esta es nueva para recoger todos los datos del recurso
router.route('/getResource/:resourceType/:resourceId')
    .get(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        if (req.params.resourceType == '1') {//RADIO
            myLibGateways.getRadioRes4Gateway(req.params.resourceId, function(result) {
                res.json(result);
            });
        }
        else if (req.params.resourceType == '2') {//TELEFONO
            myLibGateways.getTfnoRes4Gateway(req.params.resourceId, function(result) {
                res.json(result);
            });
        }
    });
//////////////////
//Otra nueva para mandar el nuevo recurso a insertar
router.route('/insertNewResource/:resource2Insert/:resourceType')
    .post(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        if (req.body.resourceType == '1') {//RADIO
            myLibGateways.insertRadioRes4Gateway(req.body.resource2Insert.radio,
                function(result) {
                    res.json(result);
                });
        }
        else if (req.body.resourceType == '2') {//TELEFONO
            myLibGateways.insertTfnoRes4Gateway(req.body.resource2Insert.telephone,
                function(result) {
                    res.json(result);
                });
        }
    });
//////////////////
//Otra nueva para editar el recurso a insertar
router.route('/updateResource/:resource2Insert/:resourceType/:resourceId')
    .put(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        if (req.body.resourceType == '1') {//RADIO
            myLibGateways.updateRadioRes4Gateway(req.body.resource2Insert.radio, req.body.resourceId,
                function(result) {
                    res.json(result);
                });
        }
        else if (req.body.resourceType == '2') {//TELEFONO
            myLibGateways.updateTfnoRes4Gateway(req.body.resource2Insert.telephone, req.body.resourceId,
                function(result) {
                    res.json(result);
                });
        }
    });

//TEST: GET http://localhost:3000/gateways/1.1.1.2/testconfig
///TEST: GET gateways/getAll/10
router.route('/getAll/:idGtw')
    .get(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        var idGtw = req.params.idGtw;
        myLibGateways.getAll(null, idGtw, function(result) {
            res.json(result);
        });
    }).
    post(function(req, res) {
        logging.Info(req.method, req.originalUrl);
    });

/********************************/
/*  Routes relating to hardware */
/********************************/
router.route('/:gateway/resources')
    .get(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        myLibGateways.getHardware(req.params.gateway, function(result) {
            var recursos = [];
            if (result.hardware != null && result.hardware.length > 0) {
                async.each(result.hardware,
                    function(p, callback) {
                        myLibHardware.getSlave(p.idSLAVES, function(data) {
                            if (data != 'NO_DATA') {
                                myLibGateways.getResources(data.hardware, p.rank, p.ipv, function(resources) {
                                    recursos = recursos.concat(resources);
                                    callback();
                                });
                            }
                            else
                                callback();
                        });
                    },
                    function(err) {
                        res.json(recursos);
                    }
                );
            }
            else
                res.json(recursos);
        });
    });


/********************************/
/* Routes relating to site 		*/
/********************************/
router.route('/:gateway/site/:site')
    .put(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        myLibGateways.updateSite(req.params.gateway, req.params.site, function(result) {
            res.json(result);
        });
    });


// Nesting routers by attaching them as middleware:
var hardwareRouter = express.Router({ mergeParams: true });
var hardwareResumeRouter = express.Router({ mergeParams: true });
router.use('/:gateway/hardware', hardwareRouter);
router.use('/:gateway/hardwareResume', hardwareResumeRouter);

hardwareResumeRouter.route('/')
    ///
    /// GET gateways/:ipv/hardwareResume
    ///
    .get(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        myLibGateways.getHardwareResume(req.params.gateway, function(result) {
            res.json(result);
        });
    });

hardwareRouter.route('/')
    ///
    /// GET gateways/:ipv/hardware
    /// 
    .get(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        myLibGateways.getHardware(req.params.gateway, function(result) {
            res.json(result);
        });
    });

hardwareRouter.route('/:hardware')
    .post(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        var hw = req.body;
        myLibHardware.AssignHardwareToGateway(hw, function(result) {
            res.json(result);
        });
    })
    .delete(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        var hw = req.body;
        myLibHardware.RemoveHardwareFromGateway(hw, function(result) {
            res.json(result);
        });
    })
    .put(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        var hw = req.body;
        myLibHardware.UpdateHardwareToGateway(hw, function(result) {
            res.json(result);
        });
    });

/****************************************/
/*	FUNCTION: updateSincGtws 			*/
/*  PARAMS: aliveGtws					*/
/*  PARAMS: gtw							*/
/*  									*/
/*  REV 1.0.2 VMG						*/
/****************************************/
function updateSincGtws(aliveGtws, gtw, idGtw, updatePend, idConfiguracion, isNotActiveCfg, InConflict) {
    var isGtwFound = false;

    for (var i = 0; i < aliveGtws.length && !isGtwFound; i++) {
        if (aliveGtws[i].idGtw == idGtw) {
            if (gtw != aliveGtws[i].ip0)//Add new IP.
                aliveGtws[i].ip1 = gtw;
            aliveGtws[i].online = true;
            aliveGtws[i].time = 0;
            aliveGtws[i].updatePend = updatePend;
            aliveGtws[i].isNotActiveCfg = isNotActiveCfg;
            aliveGtws[i].InConflict = InConflict;
            aliveGtws[i].isSinch = false;
            isGtwFound = true;
        }
    }
    if (!isGtwFound) {
        var onlineGtw = {};
        onlineGtw.idGtw = idGtw;
        onlineGtw.online = true;
        onlineGtw.idCfg = idConfiguracion;
        onlineGtw.ip0 = gtw;
        onlineGtw.time = 0;
        onlineGtw.updatePend = updatePend;
        onlineGtw.isNotActiveCfg = isNotActiveCfg;
        onlineGtw.InConflict = InConflict;
        aliveGtws.push(onlineGtw);
    }
}

/*function updateAliveGtws(aliveGtws, refreshTime) {
	var maxCycleTime=gcfg.Ulises.maxCycleTime;
	for (var i = 0;i<aliveGtws.length;i++) {
		if(aliveGtws[i].online==true) {
			aliveGtws[i].time = (aliveGtws[i].time + parseInt(refreshTime));
			if (aliveGtws[i].time >= maxCycleTime) {
				aliveGtws[i].online = false;
				aliveGtws[i].isSinch = false;
			}
		}
		else
			aliveGtws[i].isSinch = false;
	}
}*/

module.exports = router;
