/**
 * Module dependencies.
 */

var debug = require('debug')('cooli:config');
var utils = require('../lib/utils');
var env = require('./env');

/**
 * Load config options.
 */

var environment = process.env.NODE_ENV || 'development';
var filepath = './' + environment + '.json';
var config;

try {
  debug('Attempt to load config for %s env', environment);
  config = require(filepath);
} catch (e) {
  debug('Found error: %s', e.message);
  debug('Loading config settings from environment vars only');
}

config = utils.merge(config, env);
debug('Loaded config object %j', config);

/**
 * Expose `config`.
 */

module.exports = config;
