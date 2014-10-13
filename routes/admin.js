'use strict';
var express = require('express');
var passport = require('passport');
var mongoose = require('mongoose');
var async = require('async');
module.exports = function (app) {
  var User = mongoose.model('User');
  var Post = mongoose.model('Post');
  var Tag = mongoose.model('Tag');
  var postsQuery = Post.find({}).populate('tags').sort('-createdAt');
  var tagsQuery = Tag.find({}).sort('+name');
  var resources = {
    posts: postsQuery.exec.bind(postsQuery),
    tags: tagsQuery.exec.bind(tagsQuery),
  };


  var router = express.Router();
  router.get('/', app.isLoggedIn, function (req, res) {
    async.parallel(resources, function (err, result) {
      if (err) {
        console.log(err);
        return;
      }
      res.render('admin/index', {posts: result.posts, tags: result.tags});
    });
  });

  router.get('/login', function (req, res) {
    res.render('admin/login', {demo: 'Particle'});
  });

  router.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
  });

  router.post('/authenticate', function (req, res, next) {
    passport.authenticate('local', function (err, user, info) {
      if (err) {
        return next(err);
      }
      if (!user) {
        req.session.messages = [info.message];
        res.redirect('/admin/login');
      }
      req.logIn(user, function (err) {
        if (err) {
          return next(err);
        }
        res.redirect('/admin');
      });
    })(req, res, next)
  });

  router.get('/comments', app.isLoggedIn, function (req, res) {
    res.render('admin/comments', {demo: 'Pendulum'});
  });

  app.use('/admin', router);

};
