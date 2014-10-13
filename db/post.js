'use strict';

var mongoose = require('mongoose'),
    //searchPlugin = require('mongoose-search-plugin'),
    Schema = mongoose.Schema,
    Showdown = require('showdown'),
    converter = new Showdown.converter();

var PostSchema = new Schema({
  title: String,
  tagNames: String,
  tagArray: [String],
  tags: [{type: Schema.Types.ObjectId, ref: 'Tag'}],
  summary: String,
  content: String,
  html: String,
  urlString: String,
  createdAt: {type: Date, default: Date.now()}
});

//PostSchema.plugin(searchPlugin, {
  //fields: ['title', 'summary', 'tagNames']
//});

PostSchema.index({title: 'text', tagNames: 'text', summary: 'text'});

PostSchema.pre('save', function (next) {
  if (this.title) {
    this.urlString = this.title.toLocaleLowerCase().replace(/\s+/g, '-');
  }
  this.tagNames = this.tagNames.toLocaleLowerCase();
  this.html = converter.makeHtml(this.content);
  //this.createHtml();
  this.parseTags(next);
});
PostSchema.methods.createHtml = function (cb) {
  this.html = converter.makeHtml(this.content);
  cb();
};

PostSchema.methods.parseTags = function (cb) {
  if (!this.tagNames) {return cb();}

  var tagArray = this.tagNames.split(' ');
  this.tagArray = tagArray;
  this.tags = [];
  var self = this;
  var findOrCreateTag = function (name) {
    mongoose.model('Tag').findOneAndUpdate({name: name}, {name: name}, {upsert: true}, function (err, tag) {
      if (err) {console.log(err);}
      //console.log(tag.posts);
      //console.log(self._id);
      //console.log(tag.posts.indexOf(self._id));
      if (tag.posts.indexOf(self._id) < 0) {
        console.log('Pushing post to tag');
        tag.posts.push(self);
        tag.save();
      }
      self.tags.push(tag);
      if (self.tags.length === tagArray.length) {
        cb();
      }
    });
  };
  tagArray.map(findOrCreateTag);
};

mongoose.model('Post', PostSchema);
