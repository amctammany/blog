'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var TagSchema = new Schema({
  name: String,
  urlString: String,
  posts: [{type: Schema.Types.ObjectId, ref: 'Post'}]
});

TagSchema.pre('save', function (next) {
  if (this.name) {
    this.name = this.name.toLowerCase();
    this.urlString = this.name;
  }
  next();
});

mongoose.model('Tag', TagSchema);
