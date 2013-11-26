/**
 * Module dependencies.
 */

var debug = require('debug')('cooli:pio');
var OAuth = require('oauth').OAuth;

/**
 * Expose `Pio` constructor.
 */

module.exports = Pio;

/**
 * Constructor.
 *
 * @param {Object} options: OAuth settings
 * @api private
 */

function Pio(options) {
  debug('Creating Pio object');
  var baseURL = 'https://api.twitter.com/oauth/';
  this.authenticateURL = baseURL + 'authenticate?oauth_token=';

  this.oa = new OAuth(
    baseURL + 'request_token',
    baseURL + 'access_token',
    options.consumer_key,
    options.consumer_secret,
    '1.0A',
    options.callback,
    'HMAC-SHA1'
  );
  debug('Pio object created');
}

/**
 * Obtain Request Token.
 *
 * @param {Function} fn
 * @api public
 */

Pio.prototype.getRequestToken = function(fn){
  debug('Pio#%s method called', 'getRequestToken');
  var self = this;

  this.oa.getOAuthRequestToken(function(err, token, tokenSecret, res){
    if (err) return fn(err);

    var tokens = {
      requestToken: token,
      requestTokenSecret: tokenSecret
    };

    fn(err, tokens, self.authenticateURL + token);
  });
};

/**
 * Obtain Access Token.
 *
 * @param {Function} fn
 * @api public
 */

Pio.prototype.getAccessToken = function(token, tokenSecret, verifier, fn){
  debug('Pio#%s method called', 'getAccessToken');
  var cb = function(err, accessToken, accessTokenSecret, res){
    if (err) return fn(err);
    fn(err, {
      accessToken: accessToken,
      accessTokenSecret: accessTokenSecret
    });
  };

  this.oa.getOAuthAccessToken(token, tokenSecret, verifier, cb);
};
