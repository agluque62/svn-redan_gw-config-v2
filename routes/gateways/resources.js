var express = require('express');
var logging = require('../../lib/nu-log.js');

var router = express.Router();

var bodyParser = require('body-parser');
var parseUrlEncoded = bodyParser.urlencoded({ extended: false });

var myLibResources = require('../../lib/resources.js');

var gatewaysRouter = express.Router({ mergeParams: true });

gatewaysRouter.route('/')
    .get(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        myLibResources.GetResources(req, res);
        // res.status(200)
        //         .send('list overall resources from gateway: ' + req.params.gatewayId);
    });

gatewaysRouter.route('/:resourceId')
    .get(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        myLibResources.GetResource(req, res);
    });

module.exports = gatewaysRouter;