const express = require("express");
const bodyparser = require("body-parser");
const jToken = require("jsonwebtoken");
const mongoose = require("mongoose");

// Instance of express
const app = express();

// Connect to database
mongoose.connect(
  "mongodb://dbuser1:wUMR5VpjSKXia2V@ds147044.mlab.com:47044/mydb",
  { useNewUrlParser: true }
);

// Read in Schema
var Movies = require("./app/models/movies.js");

// Make mongoose use 'findOneAndUpdate()'
mongoose.set("useFindAndModify", false);

// Setup Body parser
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: false }));

app.get("/api", (req, res) => {
  Movies.find({})
    .sort({ year: 1 })
    .exec((err, Movies) => {
      if (err) {
        res.send(err);
      }
      res.json(Movies);
    });
});

app.post("/api", (req, res) => {
  // instance of movie
  var movie = new Movies();
  // create the new object
  movie.title = req.body.title;
  movie.year = req.body.year;
  movie.length = req.body.length;
  movie.desc = req.body.desc;
  movie.director = req.body.director;
  movie.genre = req.body.genre;
  movie.starring = req.body.starring;
  movie.available = req.body.available;
  movie.save(err => {
    if (err) res.send(err);
    res.json({ message: "adding movie to database" });
  });
});

app.listen(3201, () => console.log("Server started on port 3210"));
