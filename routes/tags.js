'use strict';

var mongoose = require('mongoose'),
    express = require('express');

module.exports = function (app) {
  var Tag = mongoose.model('Tag');

  var router = express.Router();

  // GET /tags => Index
  router.get('/', function (req, res) {
    Tag.find()
      .exec(function (err, tags) {
        if (err) { console.log(err); }
        res.send(tags);
      });
  });

  // GET /tags/id => Show
  router.get('/:id', function (req, res) {
    Tag.findOne({urlString: req.params.id})
      .exec(function (err, tag) {
        if (err) { console.log(err); }
        res.send(tag);
      });
  });

  // DEL /tags/id => Remove
  router.delete('/:id', function (req, res) {
    Tag.findOneAndRemove({urlString: req.params.id}, function (err, tag) {
      if (err) { console.log(err); }
      res.send(tag);
    });
  });

  // POST /tags => Create
  router.post('/', function (req, res) {
    var tag = new Tag(req.body);
    tag.save(function (err) {
      if (err) { console.log(err); }
      res.send(tag);
    });
  });

  // PUT /tags/id => Update
  router.put('/:id', function (req, res) {
    Tag.findOne({urlString: req.params.id}, function (err, tag) {
      if (err) {console.log(err);}

      tag.name = req.body.name;

      tag.save(function (err) {
        if (err) { console.log(err); }
        res.send(tag);
      });
    });
  });

  app.use('/tags', router);

};
