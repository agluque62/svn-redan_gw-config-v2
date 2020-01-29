var express = require('express');
var router = express.Router();

var bodyParser = require('body-parser');
var parseUrlEncoded = bodyParser.urlencoded({ extended: false });

var myLibConfigurations = require('../../lib/configurations.js');
var myLibGateways = require('../../lib/gateways.js');
var myLibServicesGateways = require('../../lib/services.js');
var myLibHardwareGateways = require('../../lib/hardware.js');
var myLibUsuarios = require('../../lib/users.js');

//var logging = require('../../lib/loggingDate.js');
var logging = require('../../lib/nu-log.js');

// Nesting routers by attaching them as middleware:
var gatewaysRouter = express.Router({ mergeParams: true });

function generatesRandomName(name) {
    var myDate = new Date();
    var hashArray = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
        '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T',
        'U', 'V', 'W', 'X', 'Y', 'Z', '0'];

    var monthNumber = myDate.getMonth() + 1;
    var dayNumber = myDate.getDay() + 1;
    var hourNumber = myDate.getHours() + 1;
    var minNumber = myDate.getMinutes() + 1;
    var secNumber = myDate.getSeconds() + 1;

    return (name + '#' + hashArray[monthNumber] + hashArray[dayNumber] + hashArray[hourNumber] +
        hashArray[minNumber] + hashArray[secNumber]);
}

router.use('/:configuration/gateways', gatewaysRouter);

router.route('/')	// The root path is relative the path where it's mounted in app.js (app.use('/configurations',configurations'))
    .get(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        myLibConfigurations.getConfigurations(req, res);
    });

router.route('/export/:idGtw')
    .get(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        myLibGateways.getAll(null, req.params.idGtw, function(result) {
            res.json(result);
        });
    });

router.route('/checkConfigName/:name/:idCfg')
    .get(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        myLibConfigurations.checkConfigName(req.params.name, req.params.idCfg, function(result) {
            res.json(result);
        });
    });

router.route('/active')
    .get(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        myLibConfigurations.getActiveConfiguration(req, res, function(name) {
            res.json(name);
        });
    });

router.route('/pendingActive')
    .get(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        myLibConfigurations.getPendingActiveConfiguration(req, res, function(name) {
            res.json(name);
        });
    });
router.route('/pendingActive')
    .get(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        myLibConfigurations.getPendingActiveConfiguration(req, res, function(name) {
            res.json(name);
        });
    });
router.route('/:configuration/gatewaysHasResources')
    .get(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        myLibConfigurations.gatewaysHasResources(req, res, function(name) {
            res.json(name);
        });
    });
router.route('/:configuration/gatewaysOut')
    .get(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        myLibConfigurations.gatewaysOut(req, res, req.params.configuration, function(name) {
            var aliveGtws = req.app.get('aliveGtws');
            res.json({ gtwsInConfig: name, aliveGateways: aliveGtws });
        });
    });

router.route('/SP_cfg/:cfg')
    .get(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        myLibConfigurations.SP_cfg(req.params.cfg, function(data) {
            res.json(data);
        });
    });

router.route('/listOfGateways')
    .get(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        myLibConfigurations.getListOfGateways(function(name) {
            res.json(name);
        });
    })
    .put(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        var gtw = req.body;
        myLibConfigurations.putListOfGateways(gtw, function(name) {
            res.json(name);
        });
    });

router.route('/setUpdateGateway')
    .put(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        var gtw = req.body;
        myLibConfigurations.setUpdateGateway(gtw, function(name) {
            res.json(name);
        });
    });

router.route('/:configuration')
    .post(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        var newConfiguration = req.body;
        myLibConfigurations.postConfiguration(req, res, newConfiguration, function(result) {
            res.json(result);
        });
    })
    .get(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        if (req.params.configuration != null)
            myLibConfigurations.getConfiguration(req, res, req.params.configuration);
    })
    .delete(function(req, res) {
        var cfg = req.params.configuration;
        logging.Info(req.method, req.originalUrl);
        myLibConfigurations.delConfiguration(req, res, cfg, function(result) {
            res.json(result);
        });
    })
    .put(function(req, res) {
        var cfg = req.body;
        var oldIdCfg = req.params.configuration;
        logging.Info(req.method, req.originalUrl);
        myLibConfigurations.putConfiguration(oldIdCfg, cfg, function(result) {
            res.json(result);
        });
    });

router.route('/:configuration/copy')
    .post(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        if (req.params.configuration != null && req.body.name != null) {
            myLibConfigurations.copyConfiguration(req.params.configuration, req.body, function(result) {
                res.json(result);
            });
        }
    });

router.route('/:configuration/activate/:listOfGateways')
    .get(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        if (req.params.configuration != null && req.params.listOfGateways.length > 0)
            myLibConfigurations.activateGateways(req.params.configuration, req.params.listOfGateways.split(','), function(result) {
                res.json(result);
            });
    });

router.route('/:configuration/loadChangestoGtws')
    .get(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        myLibConfigurations.loadChangestoGtws(req.params.configuration, function(result) {
            res.json(result);
        });
    });


router.route('/:configuration/activate')
    .get(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        if (req.params.configuration != null)
            myLibConfigurations.activateConfiguration(req.params.configuration, function(result) {
                var aliveGtws = req.app.get('aliveGtws');
                for (var i = 0; i < aliveGtws.length; i++) {
                    if (aliveGtws[i].idCfg == parseInt(req.params.configuration))
                        aliveGtws[i].isNotActiveCfg = false;
                    else
                        aliveGtws[i].isNotActiveCfg = true;
                }
                res.json(result);
            });
    });

router.route('/:configuration/free')
    .get(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        myLibConfigurations.getFreeGateways(req.params.configuration, function(result) {
            res.json(result);
        });
    });

router.route('/:configuration/siteName/:siteName')
    .get(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        myLibConfigurations.getSiteName(req.params.configuration, req.params.siteName, function(result) {
            res.json(result);
        });
    });

gatewaysRouter.route('/')	// The root path is relative the path where it's mounted in router.use('/:configuration/gateways',gatewaysRouter')
    .get(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        if (req.params.configuration != null)
            myLibGateways.getGateways(req, res, req.params.configuration);
    });

gatewaysRouter.route('/:gateway')
    .get(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        if (req.params.gateway != null)
            myLibGateways.getGateway(req, res, req.params.configuration, req.params.gateway, function(result) {
                res.json(result);
            });
    })
    .delete(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        if (req.params.gateway != null) {
            myLibGateways.freeGatewayFromConfiguration({ "CFG_idCFG": req.params.configuration, "CGW_idCGW": req.params.gateway }, function(result) {
                res.json(result);
            });
        }
    })
    .post(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        if (req.params.gateway != null) {
            myLibGateways.assignGatewayToConfiguration({ "CFG_idCFG": req.params.configuration, "CGW_idCGW": req.params.gateway }, function(result) {
                res.json(result);
            });
        }
    });

//TEST: GET localhost:3000/configurations/CONFIGURACION1/gateways/1.1.1.2/all
// Proporciona la configuración completa de :gateway (general, servicios, hardware, recursos)
///*  REV 1.0.2 VMG
gatewaysRouter.route('/:gateway/all')
    .get(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        //TODO pasar la ip
        myLibGateways.getAll(req.params.configuration, req.params.gateway, function(result, idGtw) {
            var aliveGtws = req.app.get('aliveGtws');
            var isGtwFound = false;
            for (var i = 0; i < aliveGtws.length && !isGtwFound; i++) {
                if (aliveGtws[i].idGtw == idGtw) {
                    isGtwFound = true;
                    aliveGtws[i].isSinch = true;
                    aliveGtws[i].online = true;
                }
            }
            res.status(200).json(result);
        });
    }).
    post(function(req, res) {
        logging.Error(req.method, req.originalUrl, 'No implementado');
        res.status(501).json({ res: 'No implementado' });
    });

gatewaysRouter.route('/:gateway/general')
    .get(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        myLibGateways.getGateway(req, res, null, req.params.gateway, function(gtw) {
            res.json({ general: gtw });
        });
    });

gatewaysRouter.route('/:gateway/servicios')
    .get(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        myLibServicesGateways.getServices(req.params.gateway, null, function(data) {
            res.json({ servicios: data.services });
        });
    });

gatewaysRouter.route('/:gateway/hardware')
    .get(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        myLibHardwareGateways.getSlaves(req.params.gateway, null, function(data) {
            res.json({ hardware: data.hardware });
        });
    });

gatewaysRouter.route('/:gateway/recursos')
    .get(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        res.redirect('/gateways/' + req.params.gateway + '/resources');
        //logging.Trace('Not implemented yet.')
        //res.status(501).json('Not implemented yet.');
    });

module.exports = router;
