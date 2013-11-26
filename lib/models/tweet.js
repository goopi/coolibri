/**
 * Module dependencies.
 */

var debug = require('debug')('cooli:tweet');

/**
 * Expose `Tweet`.
 */

exports = module.exports = Tweet;

/**
 * Initialize a new `Tweet` with the given `data`.
 *
 * @param {Object} data
 * @api public
 */

function Tweet(data) {
  debug('Creating Tweet object');
  this.id = data.id;
  this.createdAt = data.created_at;
  this.favoriteCount = data.favorite_count || 0;
  this.retweetCount = data.retweet_count;
  this.text = data.text;
}

/**
 * Return JSON-friendly object.
 *
 * @return {Object}
 * @api public
 */

Tweet.prototype.toJSON = function(){
  debug('Tweet#toJSON method called');
  return {
    id: this.id,
    createdAt: this.createdAt,
    favoriteCount: this.favoriteCount,
    retweetCount: this.retweetCount,
    text: this.text
  };
};

/**
 * Return a random number between `a` and `b`.
 *
 * @return {Number}
 * @api public
 */

Tweet.prototype.rand = function(a, b){
  return Math.floor(Math.random() * b) + a;
};

/**
 * Return an array with RGB color components.
 *
 * @return {Array} [red, green, blue]
 * @api public
 */

Tweet.prototype.getColor = function(){
  var colors = [
    [210, 228, 252], // d2e4fc
    [255, 102, 0],
    [127, 175, 27], // 7faf1b
    [66, 9, 67], // 420943
    [22, 147, 165], // 1693A5
    [255, 0, 102], // ff0066
    [251, 184, 41], // fbb829
    [255, 0, 0], // ff0000
    [211, 25, 150], // d31996
    [42, 143, 189] // 2a8fbd
  ];

  var vocals = this.text.toLowerCase().match(/a|e|i|o|u/g);
  vocals = vocals ? vocals.length % 10 : 0;
  return colors[vocals];
};

/**
 * Return the alpha component.
 *
 * @return {Number}
 * @api public
 */

Tweet.prototype.getAlpha = function(){
  return Math.round(this.text.length / 140 * 100) / 100;
};

/**
 * Return a random figure type.
 *
 * @return {Number}
 * @api public
 */

Tweet.prototype.getFigure = function(){
  return this.rand(1, 3);
};

/**
 * Return position of the figure with the given `canvas`.
 *
 * @param {Object} canvas
 * @return {Array} [x, y] coordenates
 * @api public
 */

Tweet.prototype.getPosition = function(canvas){
  return [this.rand(1, canvas.width), this.rand(1, canvas.height)];
};

/**
 * Return rotation of the figure.
 *
 * @return {Number} degrees
 * @api public
 */

Tweet.prototype.getRotation = function(){
  var sec = this.createdAt.match(/:[0-5][0-9] /)[0].replace(/:| /g, '');
  return sec * 6;
};

/**
 * Return size of the figure.
 *
 * @return {Number}
 * @api public
 */

Tweet.prototype.getSize = function(){
  var ups = this.text.match(/[A-Z]/g);
  var favs = this.favoriteCount;
  var rts = this.retweetCount;
  var size;

  ups = ups ? ups.length : 0;
  // TODO: refactor the algorithm
  size = favs * 65 + rts * 32.5 + ups * 12;

  if (size < 80) return 80;
  else if (size > 220) return 220;
  return Math.round(size);
};

/**
 * Process tweet with the given `canvas` and
 * return an object of attributes of the figure.
 *
 * @param {Object} canvas { width: Number, height: Number }
 * @return {Object}
 * @api public
 */

Tweet.prototype.process = function(canvas){
  return {
    alpha: this.getAlpha(),
    figure: this.getFigure(),
    position: this.getPosition(canvas),
    rgb: this.getColor(),
    rotation: this.getRotation(),
    size: this.getSize()
  };
};
