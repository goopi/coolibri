/**
 * Module dependencies.
 */

var debug = require('debug')('cooli:user');
var redis = require('../redis');
var noop = function(){};

/**
 * Expose `User`.
 */

exports = module.exports = User;

/**
 * Return key for redis namespacing.
 *
 * @param {Number|String} id
 * @return {String}
 * @api private
 */

function getKey(id) {
  return id ? 'user:' + id : 'user';
}

/**
 * Get or create a new user with `id`, `data`
 * and invoke callback `fn(err, user)`.
 *
 * @param {Number|String} id
 * @param {Object} data
 * @param {Function} fn
 * @api public
 */

exports.getOrCreate = function(id, data, fn){
  debug('User#getOrCreate method called');
  redis.client().sismember(['users', getKey(id)], function(err, reply){
    if (reply) return exports.getById(id, fn);
    exports.create(data, fn);
  });
};

/**
 * Get user with `id`
 * and invoke callback `fn(err, user)`.
 *
 * @param {Number|String} id
 * @param {Function} fn
 * @api public
 */

exports.getById = function(id, fn){
  debug('User#getById method called');
  if (!id) throw new Error('getById() requires an id');
  redis.client().hgetall(getKey(id), function(err, data){
    fn(err, data);
  });
};

/**
 * Create a new user with `data` and
 * invoke callback `fn(err, user)`.
 *
 * @param {Object} data
 * @param {Function} fn
 * @api public
 */

exports.create = function(data, fn){
  debug('User#create method called');
  var db = redis.client();
  var key = getKey(data.id);
  var user = {};
  var replaceImage = function(str){
    return str.replace('_normal', '_reasonably_small');
  }

  var fields = [
    ['id', 'id'],
    ['screen_name', 'username'],
    ['name', 'name'],
    ['url', 'url'],
    ['location', 'location'],
    ['profile_image_url', 'pic', replaceImage],
    ['location', 'location'],
    ['lang', 'lang'],
    ['description', 'description'],
    ['token', 'token'],
    ['tokenSecret', 'tokenSecret']
  ];
  fields.forEach(function(v){
    user[v[1]] = v[2] ? v[2](data[v[0]]) : data[v[0]];
  });

  var cmds = [];
  // add `user:uid` to `users` set
  cmds.push(['sadd', ['users', key]]);
  // add user data to `user:uid` hash
  cmds.push(['hmset', key, user, noop]);
  db.multi(cmds).exec(function(err, ret){
    if (err) return fn(err);
    fn(err, user);
  });
};

/**
 * Initialize a new `User`.
 *
 * @api public
 */

function User() {
  debug('Creating `User` object');
  this.client = redis.client();
}
