var express = require('express');
var logging = require('../../lib/nu-log.js');

var router = express.Router();

var bodyParser = require('body-parser');
var parseUrlEncoded = bodyParser.urlencoded({ extended: false });

var myLibServices = require('../../lib/services.js');

router.route('/')	// The root path is relative the path where it's mounted in app.js (app.use('/', services);)
    .get(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        myLibServices.getAllServices(function(services) {
            res.json(services);
        });
    });

router.route('/:service/gateways')
    .get(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        myLibServices.getGatewaysOfService(req.params.service, function(data) {
            res.json(data);
        });
    });

router.route('/:service')
    .get(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        var service = req.params.service;
        myLibServices.getService(service, function(data) {
            res.json({
                general: null,
                servicios: data.services
            });
        });
    })
    .post(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        var service = req.body;
        myLibServices.postService(service, function(data) {
            res.json(data);
        });
    })
    .copy(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        var targetService = req.body;
        myLibServices.postService(targetService, function(data) {
            res.status(201).json(data);
        });
    })
    .delete(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        var serviceId = req.params.service;
        myLibServices.deleteService(serviceId, function(data) {
            res.json(data);
        });
    });

module.exports = router;
