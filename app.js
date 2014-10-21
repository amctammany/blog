var express = require('express'),
    routes = require('./routes'),
    passport = require('passport');

var app = express();
app.directory = __dirname;


//var mongoUrl = 'mongodb://db:dbpass@ds061318.mongolab.com:61318/amctammany';



//if (mongoUrl) {
  //mongoose.connect(mongoUrl);
  //var db = mongoose.connection;
  //db.once('open', function () {
    //console.log('DB Connection Successful');
  //});
//}

require('./config/environments')(app, passport);
require('./db');
require('./routes')(app, passport);

module.exports = app;
