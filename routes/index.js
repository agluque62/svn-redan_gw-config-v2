var express = require('express');
var router = express.Router();
var config = require('../configUlises.json');
var myLibAuth = require('../lib/authentication.js');
var logging = require('../lib/nu-log.js');

/** 20170525. AGL. Para el control de Sesiones. */
/////////////////////////////////////////////////
// /* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index',{
//   	LoginTimeout: config.Ulises.LoginTimeOut,
//   	Region: config.Ulises.Region,
//   	BackupServiceDomain: config.Ulises.BackupServiceDomain,
// 	Version: config.Ulises.Version});

//  });

// router.get('/ajax', function(req, res) {
// 	myLibAuth.setAuthentication(req, res);
// });
//////////////////////////////////////////////
/** */
var isAuthenticated = function(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
};

/* GET home page. */
router.get('/',
    //require('connect-ensure-login').ensureLoggedIn(),
    isAuthenticated,
    function(req, res, next) {
        logging.Info(req.method, req.originalUrl);
        localSession = req.session;
        res.render('index',
            {
                LoginTimeout: config.Ulises.LoginTimeOut,
                Region: config.Ulises.Region,
                BackupServiceDomain: config.Ulises.BackupServiceDomain,
                Version: config.Ulises.Version,
                user: (req.user ? req.user : { name: 'noname', perfil: 64 }),
                session: localSession
            });
    });

router.get('/login',
    function(req, res) {
        logging.Info(req.method, req.originalUrl);
        res.render('login', { message: req.flash('error') });
    });

router.post('/login',
    require('passport').authenticate('local', { failureRedirect: '/login', failureFlash: true }),
    function(req, res) {
        logging.Info(req.method, req.originalUrl);
        res.redirect('/');
    });

router.get('/logout',
    function(req, res) {
        logging.Info(req.method, req.originalUrl);
        localSession = null;
        req.logout();
        res.redirect('/');
    });


module.exports = router;
