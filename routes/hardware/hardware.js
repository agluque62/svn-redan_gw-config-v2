var express = require('express');
var logging = require('../../lib/nu-log.js');

var router = express.Router();

var bodyParser = require('body-parser');
var parseUrlEncoded = bodyParser.urlencoded({ extended: false });

var myLibHardware = require('../../lib/hardware.js');

//var myLibServicesGateways = require('../../lib/services.js');

router.route('/')	// The root path is relative the path where it's mounted in app.js (app.use('/hardware', hardware);)
    .get(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        myLibHardware.getHardware(function(hardware) {
            res.json(hardware);
        });
    });

router.route('/site/:siteId')
    .get(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        myLibHardware.getHardwareBelongsGroup(req.params.siteId, function(hardware) {
            res.json(hardware);
        });
    });

router.route('/checkresname/:name/:idCgw/:idRes')
    .get(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        myLibHardware.getResNamesInConfig(req.params.name, req.params.idCgw, req.params.idRes,
            function(hardware) {
                res.json(hardware.error);
            });
    });

/**********************************/
/*  Routes relating to positions  */
/**********************************/
router.route('/positions/:idCgw')
    .put(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        var position = req.body;
        var newPosition = new Object();
        newPosition.colOrig = position.dataFrom.SLAVES_idSLAVES;
        newPosition.rowOrig = position.dataFrom.rank;
        newPosition.colDest = position.SLAVES_idSLAVES;
        newPosition.rowDest = position.rank;
        newPosition.type = position.type;
        newPosition.resId = position.resId;
        newPosition.idCgw = req.params.idCgw;

        myLibHardware.updatePosition(newPosition, function(result) {
            res.json(result);
        });
    });

router.route('/:hw')
    .get(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        var hw = req.params.hw;
        myLibHardware.getSlave(hw, function(hardware) {
            res.json(hardware);
        });
    })
    .delete(function(req, res) {
        var hw = req.params.hw;
        logging.Info(req.method, req.originalUrl);
        myLibHardware.delSlave(hw, function(hardware) {
            res.json(hardware);
        });
    })
    .post(function(req, res) {
        var hw = req.body;
        logging.Info(req.method, req.originalUrl);
        myLibHardware.postSlave(hw, function(hardware) {
            res.json(hardware);
        });
    })
    .put(function(req, res) {
        var hw = req.body;
        logging.Info(req.method, req.originalUrl);
        myLibHardware.putSlave(hw, function(hw) {
            res.status(201).json(hw);
        });
    });

router.route('/:hw/copy')
    .post(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        if (req.params.hw != null && req.body.name != null) {
            myLibHardware.copySlave(req.params.hw, req.body, function(result) {
                res.json(result);
            });
        }
    });

/**********************************/
/*  Routes relating to resources  */
/**********************************/
router.route('/:slave/resources/:resource')
    .post(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        var slave = req.params.slave;
        var resource = req.body;
        myLibHardware.setResource(slave, resource, function(result) {
            res.json(result);
        });
    });

module.exports = router;