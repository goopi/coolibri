/**
 * Module dependencies.
 */

var debug = require('debug')('cooli:auth');
var express = require('express');
var signing = require('signing');
var tuiter = require('tuiter');
var User = require('../models/user');
var utils = require('../utils');
var error = utils.error;
var config = require('../../config/config');

/**
 * Expose a new Express `app`.
 */

var app = module.exports = express();

/**
 * Configure the `app`.
 */

app.configure(function(){
  // set native `express` router middleware
  app.use(app.router);

  // set custom error handling middleware
  app.use(utils.errorMiddleware());
});

/**
 * Authentication routes.
 */

app.post('/auth/token', function(req, res, next){
  var keys = config.services.twitter;
  var token = req.body.token;
  var tokenSecret = req.body.token_secret;
  var uid = req.body.social_id;

  if (!token || !tokenSecret || !uid) return next(error(400, 'Bad Request'));

  keys['access_token_key'] = token;
  keys['access_token_secret'] = tokenSecret;

  tuiter(keys).verifyCredentials({}, function(err, data){
    if (err || data.id_str !== uid) return next(error(401, 'Invalid token'));

    data.token = token;
    data.tokenSecret = tokenSecret;

    User.getOrCreate(data.id, data, function(err, data){
      if (err) return next(error(401, 'Unauthorized'));
      debug('Authorized');

      res.json({
        token: signing.sign(data.id + '', config.secret, config.salt),
        uid: data.id
      });
    });
  });
});
