var express = require('express');
var logging = require('../../lib/nu-log.js');

var router = express.Router();

var myLibSites = require('../../lib/sites.js');

var bodyParser = require('body-parser');
var parseUrlEncoded = bodyParser.urlencoded({ extended: false });


router.route('/')	// The root path is relative the path where it's mounted in app.js (app.use('/sites', sites);)
    .get(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        myLibSites.getSites(req, res, function(result) {
            res.json(result);
        });
    });

router.route('/:configuration')
    .get(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        myLibSites.getSites4Config(req, res, req.params.configuration, function(result) {
            res.json(result);
        });
    });

router.route('/groups')
    .post(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        myLibSites.postGroup(req.body, function(dataGroup) {
            res.json(dataGroup);
        });
    });

router.route('/:site/:cfg')
    .put(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        myLibSites.putSite(req.params.site, req.params.cfg, req.body.name, function(data) {
            res.json(data);
        });
    });

router.route('/:site')
    .post(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        myLibSites.postSite(req.body, function(data) {
            res.json(data);
        });
    })
    .delete(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        myLibSites.deleteSite(req.params.site, function(data) {
            res.json(data);
        });
    })
    .get(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        myLibSites.getSite(req.params.site, function(result) {
            res.json(result);
        });
    });

router.route('/:site/gateways')
    .get(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        myLibSites.getGatewaysOfSite(req.params.site, function(result) {
            res.json(result);
        });
    });

router.route('/:site/groups')
    .get(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        myLibSites.getGroups(req.params.site, function(groups) {
            res.json(groups);
        });
    });

router.route('/:sourceIdSite/:targetNameSite')
    .copy(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        var sourceIdSite = req.params.sourceIdSite;
        var targetNameSite = req.params.targetNameSite;
        var sourceIdCfg = req.body.idCFG;
        myLibSites.copySite(sourceIdSite, targetNameSite, sourceIdCfg, function(result) {
            res.json(result);
        });
    });

router.route('/:site/cfg/:cfg')
    .put(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        myLibSites.updateCfg(req.params.site, req.params.cfg, function(result) {
            res.json(result);
        });
    });

module.exports = router;
