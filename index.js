/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var auth = require('./lib/auth');

/**
 * Create the app.
 */

var app = express();

/**
 * Set `app` configure settings.
 */

require('./config')(app);

/**
 * App routes.
 */

app.get('/ping', auth.ensureAuthenticated, function(req, res){
  res.send('pong\n');
});

/**
 * Attach Auth routes.
 */

app.use(require('./lib/auth/routes'));

/**
 * Web application.
 */

app.use(require('./lib/http'));

/**
 * Start web server.
 */

var server = http.createServer(app).listen(app.get('port'), function(){
  console.log('Listening on port ' + app.get('port'));
});

// sockets
var sio = require('./lib/wss');
sio.listen(server);

process.on('uncaughtException', function(err){
  console.log(err);
});
