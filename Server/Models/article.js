const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  id: String,
  title: String,
  shortDescription: String,
  longDescription: String,
  tags: [String],
  images: [String],
  videos: [String],
  date: Date,
  time: String,
  status: String
});

const Article = mongoose.model('Article', articleSchema);

module.exports = Article;
