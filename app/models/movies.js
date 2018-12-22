/*Schema for movies */
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var movieSchema = new Schema({
  title: String,
  year: Number,
  length: Number,
  desc: String,
  director: String,
  genre: [
    {
      type: String
    }
  ],
  starring: [
    {
      type: String
    }
  ],
  available: [
    {
      type: String
    }
  ]
});

module.exports = mongoose.model("movies", movieSchema);
