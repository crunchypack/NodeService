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
// this is commented since I only want one user, and wont implement admin creator interface
app.post("/api/create", (req, res) => {
  var adminData = {
    email: req.body.email,
    password: req.body.pass
  };

  Admin.create(adminData, (err, user) => {
    if (err) {
      res.send(err);
    }
    res.json({
      user
    });
  });
});
// login user
app.post("/api/login", (req, res, next) => {
  Admin.authenticate(req.body.mail, req.body.pass, (error, user) => {
    if (error || !user) {
      var err = new Error("Wrong email or password.");
      err.status = 401;
      return next(err);
    } else {
      res.json({ message: "signed in!", user });
      //   jToken.sign(
      //     { user },
      //     "thisisword",
      //     { expiresIn: "900s" },
      //     (err, token) => {
      //       sessionStorage.setItem("token", token);
      //       res.json({ message: "logged in" });
      //     }
      //   );
    }
  });
});
// Add movies to database
app.post("/api", verifyToken, (req, res) => {
  //Verify logged in admin
  jwt.verify(req.token, "thisisword", (err, auth) => {
    if (err) res.sendStatus(403);
    // Forbidden
    else {
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
// Veriy admin user is logged in
// Authorization format is: auth <token>
function verifyToken(req, res, next) {
  // Get the header auth request
  const authHead = req.headers["authorization"];
  // Check that it's definec
  if (typeof authHead !== "undefined") {
    // slit header in array[1](two fields)
    const auth = authHead.split(" ");
    // get the token
    const authToken = auth[1];
    // save it to req
    req.token = authToken;
    next();
  } else res.sendStatus(403); // Forbidden
}

app.listen(3201, () => console.log("Server started on port 3210"));
