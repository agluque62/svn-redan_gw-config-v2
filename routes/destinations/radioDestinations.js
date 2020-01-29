var express = require('express');
var logging = require('../../lib/nu-log.js');

var router = express.Router({ mergeParams: true });

var bodyParser = require('body-parser');
var parseUrlEncoded = bodyParser.urlencoded({ extended: false });

var myLibDestinations = require('../../lib/radioDestinations.js');

router.route('/')	// The root path is relative the path where it's mounted in app.js (app.use('/destinations', radioDestinations);)
    .get(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        myLibDestinations.getRadioDestinations(function(destinations) {
            res.json(destinations);
        });
    });


router.route('/:destination')
    .post(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        var dst = req.body;
        myLibDestinations.postRadioDestination(dst, function(data) {
            res.json(data);
        });
    })
    .get(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        myLibDestinations.getRadioDestination(req.params.destination, function(data) {
            res.json(data);
        });
    })
    .delete(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        myLibDestinations.deleteDestination(req.params.destination, function(data) {
            res.json(data);
        });
    })
    .put(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        myLibDestinations.putDestination(req.params.destination, req.body, function(data) {
            res.json(data);
        });
    });


router.route('/:destination/resources/:resourceId')
    .post(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        var dst = req.params.destination;
        var rsc = req.params.resourceId;
        myLibDestinations.postResourceToRadioDestination(rsc, dst, function(data) {
            res.json(data);
        });
    })
    .delete(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        var dst = req.params.destination;
        var rsc = req.params.resourceId;
        myLibDestinations.deleteResourceFromRadioDestination(rsc, dst, function(data) {
            res.json(data);
        });
    });

router.route('/:destination/uris')
    .get(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        myLibDestinations.getDestinationUris(req.params.destination, function(data) {
            res.json(data);
        });
    })
    .post(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        var uri = req.body;
        myLibDestinations.postDestinationUris(uri, function(data) {
            res.json(data);
        });
    })
    .put(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        var uri = req.body;
        myLibDestinations.putDestinationUris(uri, function(data) {
            res.json(data);
        });
    });

router.route('/:destination/uris/:uri')
    .delete(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        myLibDestinations.deleteDestinationUris(req.params.uri, function(data) {
            res.json(data);
        });
    });

module.exports = router;
