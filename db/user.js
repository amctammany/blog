'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    bcrypt = require('bcrypt-nodejs'),
    SALT_WORK_FACTOR = 10;

var UserSchema = new Schema({
  username: {type: String, required: true, unique: true},
  password: {type: String, required: true},
});

UserSchema.pre('save', function (next) {
  var user = this;
  if (!user.isModified('password')) {
    return next();
  }

  bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
    if (err) {
      return next(err);
    }
    bcrypt.hash(user.password, salt, null, function (err, hash) {
      if (err) {
        return next(err);
      }
      user.password = hash;
      next();
    });
  });
});

UserSchema.methods.comparePassword = function (candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function (err, match) {
    if (err) {
      return cb(err);
    }
    cb(null, match);
  });
};

mongoose.model('User', UserSchema);
