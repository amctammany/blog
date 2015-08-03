'use strict';

var express = require('express');

module.exports = function (app) {
  var router = express.Router();

  router.get('/particles', function (req, res) {
    res.render('demos/particles', {});
  });

  router.get('/collisions', function (req, res) {
    res.render('demos/collisions', {});
  });

  router.get('/pi', function (req, res) {
    res.render('demos/pi', {});
  });

  router.get('/classes', function (req, res) {
    res.render('demos/classes', {cache: false});
  });

  router.get('/react', function (req, res) {
    res.render('demos/react', {});
  });

  app.use('/demos', router);
};
