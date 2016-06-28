var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

var routeIndex = require('./routes/index');
var routeApp = require('./routes/app');
var routeProducts = require('./routes/products');
var routeLogout = require('./routes/logout');
var routeOAuth20_cb = require('./routes/oauth20_cb');
var routeApiV1User = require('./routes/api/v1/user');
var routeApiV1Prodsearch = require('./routes/api/v1/productsearch');

var app = express();

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({secret: "1234567890QWERTY"}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routeIndex);
app.use('/app', routeApp);
app.use('/products', routeProducts);
app.use('/logout', routeLogout);
app.use('/oauth20_cb', routeOAuth20_cb);
app.use('/api/v1/user', routeApiV1User);
app.use('/api/v1/productsearch', routeApiV1Prodsearch);

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
