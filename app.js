const express = require("express");
const bodyparser = require("body-parser");
const jToken = require("jsonwebtoken");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
// Instance of express
const app = express();

// Connect to database
mongoose.connect(
  "mongodb://dbuser1:wUMR5VpjSKXia2V@ds147044.mlab.com:47044/mydb",
  { useNewUrlParser: true }
);
// Use sessions

app.use(
  session({
    secret: "someguy",
    resave: false,
    saveUninitialized: true
  })
);
// Allow Cross-origin resourse
app.use(cors());
// Read in Schemas
var Movies = require("./app/models/movies.js");
var Admin = require("./app/models/admin.js");
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
// Create Admin user
// This is commented since I only want one user, and wont implement admin creator interface
// app.post("/api/create", (req, res) => {
//   var adminData = {
//     email: req.body.email,
//     password: req.body.pass
//   };

//   Admin.create(adminData, (err, user) => {
//     if (err) {
//       res.send(err);
//     }
//     res.json({
//       user
//     });
//   });
// });
// login user
app.post("/api/login", (req, res, next) => {
  console.log("request recieved");
  Admin.authenticate(req.body.mail, req.body.pass, (error, user) => {
    console.log("Authenticating");
    if (error || !user) {
      console.log("error");
      var err = new Error("Wrong email or password.");
      err.status = 401;
      return next(err);
    } else {
      console.log("no error");
      jToken.sign(
        { user },
        "thisisword",
        { expiresIn: "900s" },
        (err, token) => {
          if (err) console.log(err);
          console.log("create token");
          req.session.token = token;
          res.json({ token });
        }
      );
    }
  });
});
// Add movies to database
app.post("/api", (req, res) => {
  //Verify logged in admin
  jToken.verify(req.session.token, "thisisword", (err, auth) => {
    if (err) res.sendStatus(403);
    // Forbidden
    else {
      console.log("success");
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
      movie.url = req.body.url;
      movie.save(err => {
        if (err) res.send(err);
        res.json({
          message: "user " + auth.user.email + " added movie to database"
        });
      });
    }
  });
});
app.set("port", 8081);
app.listen(app.get("port"), () =>
  console.log("Server started on port " + app.get("port"))
);
