/**
 * Created by vjmolina on 13/9/17.
 */
var express = require('express');
var logging = require('../../lib/nu-log.js');

var router = express.Router();

var bodyParser = require('body-parser');
var parseUrlEncoded = bodyParser.urlencoded({ extended: false });
// app.use();        // to support URL-encoded bodies
var myLibExtResources = require('../../lib/externalResources.js');

router.route('/:extType')	// The root path is relative the path where it's mounted in app.js (app.use('/accessControl',controlAccess'))
    .get(function(req, res) {
        myLibExtResources.getExternalResources(req.params.extType, req, res);
    })
    .post(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        myLibExtResources.postExternalResource(req.body, function(data) {
            res.json(data);
        });
    })
    .put(function(req, res) {
        logging.Error(req.method, req.originalUrl, 'No Implementado');
        //myLibTable.putTableBss(req.body,function(data){
        //	res.json(data);
        //});
    });
router.route('/radio/:extType')	// The root path is relative the path where it's mounted in app.js (app.use('/accessControl',controlAccess'))
    .get(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        myLibExtResources.getRadioExternalResources(req.params.extType, req, res);
    });

router.route('/filterResources/:filterType/:chars2Find')
    .get(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        myLibExtResources.filterExternalResources(req.params.filterType, req.params.chars2Find, function(data) {
            res.json(data);
        });
    });
router.route('/filterPhoneResources/:filterType/:chars2Find')
    .get(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        myLibExtResources.filterExternalPhoneResources(req.params.filterType, req.params.chars2Find, function(data) {
            res.json(data);
        });
    });
router.route('/getResource/:idExtResource')
    .get(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        myLibExtResources.getExternalResource(req.params.idExtResource, function(data) {
            res.json(data);
        });
    })
    .delete(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        myLibExtResources.deleteExternalResource(req.params.idExtResource, function(data) {
            res.json(data);
        });
    });

module.exports = router;