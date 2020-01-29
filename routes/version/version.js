/**
 * Created by vjmolina on 2/3/17.
 */
var logging = require('../../lib/nu-log.js');
var express = require('express');

var router = express.Router();

var bodyParser = require('body-parser');
var parseUrlEncoded = bodyParser.urlencoded({ extended: false });

var myLibVersion = require('../../lib/version.js');

router.route('/')	// The root path is relative the path where it's mounted in app.js (app.use('/accessControl',controlAccess'))
    .get(function (req, res) {
        logging.Info(req.method, req.originalUrl);
        myLibVersion.getVersion(function (result) {
            res.json(result);
        });
    });

module.exports = router;