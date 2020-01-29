var express = require('express');
var logging = require('../../lib/nu-log.js');

var router = express.Router();

var bodyParser = require('body-parser');
var parseUrlEncoded = bodyParser.urlencoded({ extended: false });
// app.use();        // to support URL-encoded bodies
var myLibTable = require('../../lib/tableBss.js');

router.route('/')	// The root path is relative the path where it's mounted in app.js (app.use('/accessControl',controlAccess'))
    .get(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        myLibTable.getTablesBss(req, res);
    })
    .post(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        myLibTable.postTableBss(req.body, function(data) {
            res.json(data);
        });
    })
    .put(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        myLibTable.putTableBss(req.body, function(data) {
            res.json(data);
        });
    });

router.route('/:idTable')
    .get(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        myLibTable.getTableBss(req.params.idTable, function(data) {
            res.json(data);
        });
    })
    .delete(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        myLibTable.deleteTableBss(req.params.idTable, function(data) {
            res.json(data);
        });
    });

module.exports = router;

