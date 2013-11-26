
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
