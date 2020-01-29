var express = require('express');
var logging = require('../../lib/nu-log.js');

var router = express.Router();

var bodyParser = require('body-parser');
var parseUrlEncoded = bodyParser.urlencoded({ extended: false });
// app.use();        // to support URL-encoded bodies
var myLibUsers = require('../../lib/users.js');

router.route('/')	// The root path is relative the path where it's mounted in app.js (app.use('/accessControl',controlAccess'))
    .get(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        if (req.query.name != null && req.query.clave != null) {
            var usr = {};
            usr.name = req.query.name;
            usr.clave = req.query.clave;
            myLibUsers.testUser(req, res, usr);
        }
        else
            myLibUsers.getUsers(req, res);
    });


router.route('/:usuario')
    .post(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        var newUser = req.body.user;
        var gtws = req.body.gateways;
        myLibUsers.postUser(req, res, newUser, gtws, function(result) {
            res.json(result);
        });
    })
    .get(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        var usr = req.query;
        if (req.params.usuario == 'null')
            res.render('./services/postUsuario');
        else
            myLibUsers.testUser(req, res, usr);
    })
    .delete(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        var usr = req.params.usuario;
        myLibUsers.delUser(req, res, usr);
    })
    .put(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        var usr = req.body.user;
        var gtws = req.body.gateways;
        myLibUsers.putUser(req, res, usr, gtws, function(result) {
            res.json(result);
        });

    });

module.exports = router;
