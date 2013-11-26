/**
 * Module dependencies.
 */

var signing = require('signing');
var User = require('../models/user');
var error = require('../utils').error;
var config = require('../../config/config');

/**
 * Simple route middleware to ensure request
 * is authenticated.
 */

// Use this middleware on any resource that needs to be
// protected. If the request is authenticated will proceed.
// Otherwise next(error).
exports.ensureAuthenticated = function(req, res, next){
  var token = req.headers['authorization'];
  // token isn't present
  if (!token) return next(error(400, 'Token required'));

  function _401() {
    res.statusCode = 401;
    res.set('WWW-Authenticate', 'CWS');
    return error(401, 'invalid token');
  }

  var uid = signing.unsign(token, config.secret, config.salt);
  // token is invalid
  if (!uid) return next(_401());

  User.getById(uid, function(err, user){
    // user does not exist
    if (!user) return next(_401());

    // all good, store req.user for route access
    req.user = user;
    return next();
  });
};
