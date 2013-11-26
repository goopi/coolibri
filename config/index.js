/**
 * Module dependencies.
 */

var debug = require('debug')('cooli:configure');
var express = require('express');
var config = require('./config');
var redis = require('../lib/redis');
var utils = require('../lib/utils');

/**
 * Expose `configure`.
 */

module.exports = configure;

/**
 * Configure the given Express `app`.
 *
 * @param {App} app
 * @api public
 */

function configure(app) {
  // set development only settings

  app.configure('development', function(){
    debug('Set development only settings');
    // app.use(express.errorHandler());
  });

  // set common settings

  app.configure(function(){
    debug('Set common settings');

    // save config options in app
    app.set('config', config);

    // set http server port from `env` or `config` options
    app.set('port', process.env.PORT || config.port);

    // configure native `express` logger
    app.use(express.logger('dev'));

    // set native `express` body parser
    // FIXME: `connect.multipart()` will be removed in connect 3.0
    // visit https://github.com/senchalabs/connect/wiki/Connect-3.0
    // for more details
    // app.use(express.bodyParser());
    app.use(express.urlencoded());
    app.use(express.json());

    // provides faux HTTP method support
    app.use(express.methodOverride());

    // set native `express` router middleware
    app.use(app.router);

    // set custom error handling middleware
    app.use(utils.errorMiddleware());
  });
}

/**
 * Configure Redis client.
 */

redis.createClient = function(){
  var cli = require('redis').createClient();
  cli.on('error', function(err){
    debug('Redis error: ' + err);
  });
  return cli;
};
