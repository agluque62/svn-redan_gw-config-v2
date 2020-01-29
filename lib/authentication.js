exports.setAuthentication = function setAuthentication(req, res) {
    var app = require('../app');

    app.locals.AuthenticatedUser = 'none';
    app.locals.isAuthenticated = false;
};
