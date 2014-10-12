'use strict';

var express = require('express'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    mongoose = require('mongoose'),
    path = require('path');

module.exports = function (app, passport) {
  var env = process.env.NODE_ENV;
  if ('production' === env) {
    var mongoUrl = 'localhost:27017/blog';



    if (mongoUrl) {
      mongoose.connect(mongoUrl);
      var db = mongoose.connection;
      db.once('open', function () {
        console.log('DB Connection Successful');
      });
    }
    app.set('port', process.env.PORT || 9000);
    app.set('views', path.join(app.directory, '/dist/views'));
    app.engine('html', require('ejs').renderFile);
    app.set('view engine', 'html');
    app.use('/', express.static(path.join(app.directory, 'dist')));
    app.use('/src', express.static(path.join(app.directory, 'src')));
    app.use('/images', express.static(path.join(app.directory, 'images')));
    app.use('/doc', express.static(path.join(app.directory, 'doc')));
    app.use(bodyParser());
    app.use(cookieParser());

    app.use(session({secret: 'mysupersecretpassword'}));
    app.use(passport.initialize());
    app.use(passport.session());
  }
};
