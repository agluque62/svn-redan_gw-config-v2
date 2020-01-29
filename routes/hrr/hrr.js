var express = require('express');
var router = express.Router();

var bodyParser = require('body-parser');
var parseUrlEncoded = bodyParser.urlencoded({ extended: false });

var myLibHrr = require('../../lib/hrr.js');

var logging = require('../../lib/nu-log.js');

function generatesRandomName(name) {
    var myDate = new Date();
    var hashArray = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
        '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T',
        'U', 'V', 'W', 'X', 'Y', 'Z', '0'];

    var monthNumber = myDate.getMonth() + 1;
    var dayNumber = myDate.getDay() + 1;
    var hourNumber = myDate.getHours() + 1;
    var minNumber = myDate.getMinutes() + 1;
    var secNumber = myDate.getSeconds() + 1;

    return (name + '#' + hashArray[monthNumber] + hashArray[dayNumber] + hashArray[hourNumber] +
        hashArray[minNumber] + hashArray[secNumber]);
}


router.route('/getHrr')	// The root path is relative the path where it's mounted in app.js (app.use('/configurations',configurations'))
    .get(function(req, res) {
        logging.Info(req.method, req.originalUrl);
        myLibHrr.getConfigurations(req, res);
    });


module.exports = router;
