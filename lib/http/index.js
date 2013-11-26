/**
 * Module dependencies.
 */

var debug = require('debug')('cooli:http');
var express = require('express');
var nib = require('nib');
var signing = require('signing');
var stylus = require('stylus');
var tuiter = require('tuiter');
var User = require('../models/user');
var Pio = require('../pio');
var config = require('../../config/config');

/**
 * Expose a new Express `app`.
 */

var app = module.exports = express();

/**
 * Configure the `app`.
 */

app.configure(function(){
  function compile(str, path) {
    return stylus(str).set('filename', path).set('compress', true).use(nib());
  }

  // set `views` directory
  app.set('views', __dirname + '/views');

  // set `view engine` to `jade`
  app.set('view engine', 'jade');

  // set stylus middleware
  app.use(stylus.middleware({ src: __dirname + '/public', compile: compile }));

  // set static assets default path
  app.use(express.static(__dirname + '/public'));

  // set `favicon` middleware
  app.use(express.favicon());

  // configure native `express` cookie parser
  app.use(express.cookieParser());

  // configure native `express` session middleware
  app.use(express.session({ secret: config.secret }));
});

/**
 * Create a new `Pio`.
 */

var keys = config.services.twitter;
var pio = new Pio(keys);

/**
 * App routes.
 */

app.get('/', function(req, res){
  var sess = req.session;
  var logged = !!sess.username;
  res.render('index', { layout: true, logged: logged, token: sess.token });
});

app.get('/service/authorize/twitter', function(req, res){
  debug('Login with Twitter');
  pio.getRequestToken(function(err, tokens, url){
    if (err) return res.send('Error getting the Request Token');
    req.session.oauth = tokens;
    res.redirect(url);
  });
});

app.get('/service/callback/twitter', function(req, res){
  debug('Twitter callback called');
  if (!req.session.oauth) return;

  var requestToken = req.session.oauth.requestToken;
  var requestTokenSecret = req.session.oauth.requestTokenSecret;
  var verifier = req.query.oauth_verifier;

  function cb(err, tokens) {
    if (err) return res.send('Error getting the Access Token');

    keys['access_token_key'] = tokens.accessToken;
    keys['access_token_secret'] = tokens.accessTokenSecret;

    debug('Verifying credentials');
    tuiter(keys).verifyCredentials({}, function(err, data){
      if (err) return res.redirect('/');

      data.token = tokens.accessToken;
      data.tokenSecret = tokens.accessTokenSecret;

      User.getOrCreate(data.id_str, data, function(err, data){
        if (!err) {
          delete req.session.oauth;
          req.session.username = data.username;
          req.session.token = signing.sign(data.id + '', config.secret, config.salt);
          debug('Logged in');
        }
        res.redirect('/');
      });
    });
  }

  pio.getAccessToken(requestToken, requestTokenSecret, verifier, cb);
});

app.get('/logout', function(req, res){
  req.session.destroy(function(){
    res.redirect('/');
  });
});
