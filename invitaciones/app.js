var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var dotenv = require('dotenv');
dotenv.load();

// Database
var mongo = require('mongoskin');
console.log('connecting to: ' + process.env.MONGOLAB_URI);
var db = mongo.db(process.env.MONGOLAB_URI, { native_parser: true });

//var db = mongo.db("mongodb://localhost:27017/invitaciones", { native_parser: true });

var routes = require('./routes/index');
var backend = require('./routes/backend');
var guest = require('./routes/guest');
var auth = require('./routes/auth');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Make our db accessible to our router
app.use(function (req, res, next) {
    req.db = db;
    next();
});

app.all('/api/backend/*', function (req, res, next) {
    console.log('admin');

    var db = req.db;
    var authorization = req.headers.authorization;
    console.log(authorization);

    //get timestamp now - 180 minutes
    var timestamp = new Date(Date.now() - 180 * 60000).getTime();

    db.collection('administrators').findOne({ 'guid': authorization, timestamp: { $gt: timestamp } }, function (err, user) {
        if (err) {
            res.send(401, "Credenciales no validas.");
            return;
        }

        if (!user) {
            res.send(401, "Credenciales no validas.");
            return;
        }
        console.log('next!');
        next();
    });

    //next();
});

app.use('/', routes);
app.use('/api/auth', auth);
app.use('/api/backend', backend);
app.use('/api/guest', guest);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
