var mongoose = require('mongoose');
var LocalStrategy = require('passport-local').Strategy;
module.exports = function (app, passport) {
  var User = mongoose.model('User');
    passport.serializeUser(function(user, done) {
      done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
      User.findById(id, function (err, user) {
        done(err, user);
      });
    });


    // Use the LocalStrategy within Passport.
    // Strategies in passport require a `verify` function, which accept
    // credentials (in this case, a username and password), and invoke a callback
    // with a user object. In the real world, this would query a database;
    // however, in this example we are using a baked-in set of users.
    passport.use(new LocalStrategy(function(username, password, done) {
      User.findOne({ username: username }, function(err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false, { message: 'Unknown user ' + username }); }
        user.comparePassword(password, function(err, isMatch) {
          if (err) {return done(err);}
          if(isMatch) {
            return done(null, user);
          } else {
            return done(null, false, { message: 'Invalid password' });
          }
        });
      });
    }));
    app.isLoggedIn = function (req, res, next) {
      if (req.isAuthenticated()) {
        return next();
      }
      res.redirect('/admin/login');
    };

  var Post = mongoose.model('Post');
  var Tag = mongoose.model('Tag');
  require('./admin')(app);
  require('./demos')(app);
  require('./posts')(app);
  //require('./tags')(app);
  //require('./projects')(app);
  var postsQuery = Post.find({}).populate('tags');
  var tagsQuery = Tag.find({});
  var resources = {
    posts: postsQuery.exec.bind(postsQuery),
    tags: tagsQuery.exec.bind(tagsQuery),
  };

  // GET /posts => Index
  app.get('/', function (req, res) {
    res.redirect('/posts');
  });

  //app.get('/', function (req, res) {
    //res.render('index', {posts: ['hi', 'you', 'guys']});
  //});
};
