/**
 * Module dependencies.
 */

var sio = require('socket.io');
var signing = require('signing');
var tuiter = require('tuiter');
var Tweet = require('./models/tweet');
var User = require('./models/user');
var config = require('../config/config');

var currentCanvas = {};
var currentHashtag = {};

/**
 * Expose `listen`.
 */

exports.listen = function(server){
  var io = sio.listen(server);

  io.enable('authorization');
  io.enable('browser client minification');
  io.enable('browser client etag');
  io.enable('browser client gzip');
  io.set('log level', 3);
  io.set('transports', ['websocket']);

  io.configure(function(){
    io.set('authorization', function(handshakeData, cb){
      var token = handshakeData.query.token;
      // token isn't present
      if (!token) return cb(new TypeError('Token required'));

      var uid = signing.unsign(token, config.secret, config.salt);

      // token isn't valid
      if (!uid) return cb(null, false);

      User.getById(uid, function(err, user){
        if (!user) return cb(null, false);
        handshakeData.user = user;
        cb(null, true);
      });
    });
  });

  io.on('connection', function(socket){
    var u = socket.handshake.user;
    setHashtag(socket);
    setCanvas(socket);
    handleTweets(socket, u);
    handleClientDisconnection(socket);
  });
};

/**
 * Set current #hashtag.
 */

function setHashtag(socket) {
  socket.on('setHashtag', function(ht){
    currentHashtag[socket.id] = ht;
    if (currentCanvas[socket.id]) socket.emit('ready');
  });
}

/**
 * Set current canvas.
 */

function setCanvas(socket) {
  socket.on('setCanvas', function(canvas){
    currentCanvas[socket.id] = canvas;
    if (currentHashtag[socket.id]) socket.emit('ready');
  });
}

/**
 * Handle `tweets`.
 */

function handleTweets(socket, user) {
  var keys = config.services.twitter;
  var tweet;

  socket.on('tweets', function(){
    var canvas = currentCanvas[socket.id];
    var ht = currentHashtag[socket.id];
    if (!canvas || !ht) return;

    keys['access_token_key'] = user.token;
    keys['access_token_secret'] = user.tokenSecret;

    tuiter(keys).filter({ track: ht }, function(stream){
      stream.on('error', function(e){
        console.log(e);
      });

      stream.on('tweet', function(data){
        tweet = new Tweet(data);
        socket.emit('tweets', { tweet: tweet, picture: tweet.process(canvas) });
      });

      socket.on('stop', function(){
        stream.emit('end');
        socket.disconnect();
      });
    });
  });
}

/**
 * Handle `disconnect`.
 */

function handleClientDisconnection(socket) {
  socket.on('disconnect', function(){
    delete currentCanvas[socket.id];
    delete currentHashtag[socket.id];
  });
}
