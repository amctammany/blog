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

  app.use('/demos', router);
};
