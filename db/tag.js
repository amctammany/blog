'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var TagSchema = new Schema({
  name: String,
  urlString: String,
  posts: [{type: Schema.Types.ObjectId, ref: 'Post'}],
  count: {type: Number, default: 0},
});

TagSchema.pre('save', function (next) {
  if (this.name) {
    this.name = this.name.toLowerCase();
    this.urlString = this.name;
    this.count = this.posts.length;
  }
  next();
});

mongoose.model('Tag', TagSchema);
