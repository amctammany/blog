'use strict';

var mongoose = require('mongoose'),
    express = require('express'),
    async = require('async');

module.exports = function (app) {
  var Post = mongoose.model('Post');
  var Tag = mongoose.model('Tag');

  function cullTags () {
    Tag.find()
      .populate('posts')
      .exec(function (err, tags) {
        tags.forEach(function (tag) {
          var oldTags = tag.posts;
          var newTags = tag.posts.filter(function(p) { return p.tags.indexOf(tag.id) >= 0;});
          //console.log(newTags.length);

          if (newTags.length === 0) {
            console.log('Tag: ' + tag + ' has no posts ');
            tag.remove(function (err, removedTag) {
              //console.log(removedTag);
            });
          } else {
            tag.count = newTags.length;
            tag.save();
          }
        });
      });
  }


  var router = express.Router();
  var postsQuery = Post.find({}).populate('tags').sort('-createdAt');
  var topPostsQuery = Post.find({}).sort('-viewCount').limit(10);
  var tagsQuery = Tag.find({}).sort('-count');
  var resources = {
    posts: postsQuery.exec.bind(postsQuery),
    topPosts: topPostsQuery.exec.bind(topPostsQuery),
    tags: tagsQuery.exec.bind(tagsQuery),
  };

  var searchQuery = function (q, tags) {
    var p = (!!q ? Post.find(
      {$text: {$search: q}}
    ) : Post.find({}))
      .populate('tags')
      .sort('-createdAt');

    return tags.length > 0 ? p.where('tagArray').in(tags) : p;

  };
  var searchResources = function (q, tags) {
    var search = searchQuery(q, tags);
    return {
      posts: search.exec.bind(search),
      tags: tagsQuery.exec.bind(tagsQuery),
    };
  };

  // GET /posts => Index
  router.get('/', function (req, res) {
    //console.log(req.Suery);
    //Post.find()
      //.populate('tags')
      //.exec(function (err, posts) {
        //if (err) { console.log(err); }
        //res.render('posts/index', {posts: posts});
      //});
    async.parallel(resources, function (err, result) {
      if (err) {
        console.log(err);
        return;
      }
      res.render('posts/index', {
        posts: result.posts,
        tags: result.tags,
        topPosts: result.topPosts,
      });
    });
  });

  // GET /posts/search?q=query => Search
  router.get('/search', function (req, res) {
    var q = req.query.q;
    var tags =  req.query.tags || [];
    tags = tags instanceof Array ? tags : [tags];
    async.parallel(searchResources(q, tags), function (err, result) {
      if (err) {
        console.log(err);
        return;
      }
      //console.log(result.posts);
      res.render('posts/search', {
        posts: result.posts,
        tags: result.tags,
        q: q,
        selectedTags: tags
      });
    });

  });

  // GET /posts/new => New
  router.get('/new', app.isLoggedIn, function (req, res) {
    res.render('posts/new', {post: 'foo'});
  });
  // GET /posts/id/edit => Edit
  router.get('/:id/edit', app.isLoggedIn, function (req, res) {
    res.redirect('/admin/' + req.params.id);
    //Post.findOne({urlString: req.params.id})
      //.populate('tags')
      //.exec(function (err, post) {
        //if (err) { console.log(err); }
        //res.render('posts/edit', {post: post})
      //});
  });

  // GET /posts/id => Show
  router.get('/:id', function (req, res) {
    Post.findOne({urlString: req.params.id})
      .populate('tags')
      .exec(function (err, post) {
        if (err) { console.log(err); }
        res.render('posts/show', {post: post})
        post.incrementViewCount();
      });
  });


  // DEL /posts/id => Remove
  router.delete('/:id', app.isLoggedIn,  function (req, res) {
    console.log('delete');
    Post.findOneAndRemove({urlString: req.params.id})
      .populate('tags')
      .exec(function (err, post) {
        post.populate('tags');
        if (err) { console.log(err); }
        post.tags.forEach(function (tag) {
          console.log('removing tag:' + tag.name);
          tag.posts.splice(tag.posts.indexOf(post._id, 1));
          tag.save();
        });
        res.send(post);
      });
    cullTags();
  });

  // POST /posts => Create
  router.post('/', app.isLoggedIn, function (req, res) {
    console.log(req.body);
    var post = new Post(req.body);
    post.save(function (err) {
      if (err) { console.log(err); }
      res.redirect('/posts/' + post.urlString);
    });
  });

  // POST /posts/id => Update
  router.post('/:id', app.isLoggedIn, function (req, res) {
    console.log('update');
    Post.findOne({urlString: req.params.id}, function (err, post) {
      if (err) {console.log(err);}
      post.title = req.body.title;
      post.tagNames = req.body.tagNames.toLowerCase();
      post.summary = req.body.summary;
      post.content = req.body.content;

      post.save(function (err) {
        if (err) { console.log(err); }
        res.redirect('/posts/' + post.urlString);
      });
    });
    cullTags();
  });

  app.use('/posts', router);

};
