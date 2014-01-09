'use strict';

function loadImages(srcs, fn) {
  var images = [];
  var loaded = 0;
  var total = srcs.length;
  var img;

  srcs.forEach(function(src){
    img = new Image;
    img.onload = function(){
      if (++loaded == total) fn(images);
    };
    img.src = src;
    images.push(img);
  });
}

function intro(ctx, width, height, fn) {
  var srcs = ['/images/irbis.png', '/images/esmile.png'];

  loadImages(srcs, function(images){
    var x = width / 2 - 250;
    var y = height / 2 - 100;
    var a = 0.02;

    ctx.globalAlpha = 0;
    (function loop() {
      ctx.globalAlpha += a;
      // clear the canvas for redrawing
      ctx.clearRect(0, 0, width, height);
      // draw images
      ctx.drawImage(images[0], x, y);
      ctx.drawImage(images[1], x + 300, y);

      setTimeout(function(){
        if (ctx.globalAlpha > 0.99) {
          a = -a;
          setTimeout(function(){ loop(); }, 1000);
        } else if (ctx.globalAlpha > 0.01) {
          loop();
        } else {
          ctx.globalAlpha = 1;
          fn();
        }
      }, 50);
    })();
  });
}

var socket = io.connect('/', { query: 'token=' + token });

document.addEventListener('DOMContentLoaded', function(){
  var canvas = qid('canvas');
  var ctx = canvas.getContext('2d');
  var tweets = [];
  var deleted = [];
  var timer;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  socket.on('connect', function(){
    log('Connected');

    intro(ctx, canvas.width, canvas.height, function(){
      log('Intro');
      socket.emit('setHashtag', 'messi');
      socket.emit('setCanvas', { width: canvas.width, height: canvas.height });
    });

    socket.on('disconnect', function(){
      log('Disconnected');
    });

    socket.on('ready', function(){
      log('Ready for tweets');
      socket.emit('tweets');

      function stop(e) {
        log('Stop');
        e.preventDefault();
        qcl('hide').style.display = 'none';
        qcl('stop').removeEventListener('click', stop, false);

        socket.emit('stop');
        clearTimeout(timer);
      }

      qcl('hide').style.display = 'inline';
      qcl('stop').addEventListener('click', stop, false);

      socket.on('tweets', function(data){
        tweets.push(new Picture(data.picture, ctx));
      });

      (function loop() {
        // clear the canvas for redrawing
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (var i = 0, l = tweets.length; i < l; i++) {
          if (!tweets[i].deleted) {
            tweets[i].fwd();
            tweets[i].draw();
          }
        }

        timer = setTimeout(function(){
          loop();
        }, 50);
      })();
    });
  });
}, false);
