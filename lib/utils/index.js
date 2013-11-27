/**
 * Module dependencies.
 */

var type = require('type-component');

/**
 * Create an error with `.code`.
 *
 * @param {Number} code
 * @param {String} message
 * @return {Error}
 * @api public
 */

exports.error = function(code, message){
  var err = new Error(message);
  err.code = code;
  return err;
};

/**
 * Error handling middleware.
 */

exports.errorMiddleware = function(){
  return function(err, req, res, next){
    var code = err.code || 500;
    res.send(code, { code: code, message: err.message });
  };
};

/**
 * Merge `b` into `a`.
 *
 * @param {Object} a
 * @param {Object} b
 * @return {Object} a
 * @api public
 */

exports.merge = function(a, b){
  var has = Object.prototype.hasOwnProperty;
  for (var key in b) {
    if (has.call(b, key) && b[key] != null) {
      if (!a) a = {};
      if ('object' === type(b[key])) {
        a[key] = exports.merge(a[key], b[key]);
      } else {
        a[key] = b[key];
      }
    }
  }
  return a;
};
