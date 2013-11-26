/**
 * Module dependencies.
 */

var redis = require('redis');

/**
 * Create a RedisClient.
 *
 * @return {RedisClient}
 * @api private
 */

exports.createClient = function(){
  return redis.createClient();
};

/**
 * Create or return the existing RedisClient.
 *
 * @return {RedisClient}
 * @api private
 */

exports.client = function(){
  return exports._client || (exports._client = exports.createClient());
};
