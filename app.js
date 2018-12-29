// Import
const express = require("express");
const bodyparser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const MongoStore = require('connect-mongo')(session);
// Instance of express
const app = express();

// Connect to database
mongoose.connect(
  "mongodb://dbuser1:wUMR5VpjSKXia2V@ds147044.mlab.com:47044/mydb",
  { useNewUrlParser: true }
);
let db = mongoose.connection;

// Control db errors
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function() {
  console.log("connection established to database");
});

// Use sessions
app.use(
  session({
    secret: "someguy",
    resave: false,
    saveUninitialized: true,
    store: new MongoStore({
      mongooseConnection: db
    })
  })
);
// Allow Cross-origin resourse
app.use(cors({
	origin:'http://localhost:8080',
	methods:'GET,POST,DELETE,PUT',
	credentials: true
}));
// Read in Schemas
var Movies = require("./app/models/movies.js");
var Admin = require("./app/models/admin.js");
// Make mongoose use 'findOneAndUpdate()'
mongoose.set("useFindAndModify", false);

// Setup Body parser
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: false }));
// Get all movies
app.get("/api", (req, res) => {
  Movies.find({})
    .sort({ year: -1 })
    .exec((err, Movies) => {
      if (err) {
        res.send(err);
      }
      res.json(Movies);
    });
});
// Get movie by id
app.get("/api/movie/:id", (req, res) => {
  Movies.findById(req.params.id, function(err, movie) {
    if (err) res.send(err);
    res.json(movie);
  });
});
// Create Admin user
// This is commented since I only want one user, and wont implement admin creator interface
app.post("/api/create", (req, res) => {
  var adminData = {
    email: req.body.email,
    password: req.body.pass
  };

  Admin.create(adminData, (err, user) => {
    if (err) {
      res.send(err);
    } else {
      res.json({
        user
      });
    }
  });
});
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
      req.session.userID = user._id;
      res.json({ message: user.email + " logged in" });
    }
  });
});
//check if user is logged in
app.get('/api/logged',(req,res,next)=>{
  Admin.findById(req.session.userID).exec(function(err,user){
    if(err){
      res.json({status:"error"});
    }else{
      if(user === null){
        res.json({status:"false"});
      }else {
        res.json({status:"true"});
      }
    }
  })
});
// Add movies to database
app.post("/api", (req, res, next) => {
  //Verify logged in admin
  Admin.findById(req.session.userID).exec(function(error, user) {
    if (error) {
      return next(error);
    } else {
      if (user === null) {
        let err = new Error("Not authorized");
        err.status = 400;
        return next(err);
      } else {
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
          if (err){ res.send(err);}
	  else{
           res.json({
            message:
              "movie " +
              movie.title +
              " added by " +
              user.email +
              " to database"
          });
	  }
        });
      }
    }
  });
});
// Update movie
app.put("/api/update/:id", (req, res) => {
  Admin.findById(req.session.userID).exec(function(error, user) {
    if (error) {
      return next(error);
    } else {
      if (user === null) {
        let err = new Error("Not authorized");
        err.status = 400;
        return next(err);
      } else {
        let upID = req.params.id;
        Movies.findByIdAndUpdate(
          upID,
          {
            title: req.body.title,
            year: req.body.year,
            lenght: req.body.lenght,
            desc: req.body.desc,
            director: req.body.director,
            genre: req.body.genre,
            starring: req.body.starring,
            url: req.body.url
          },
          { new: true },
          function(err, movie) {
            if (err) res.send(err);
            res.json({ message: "Updated movie: " + movie.title });
          }
        );
      }
    }
  });
});
// Delete movie from database
app.delete("/api/delete/:id", (req, res, next) => {
  Admin.findById(req.session.userID).exec(function(error, user) {
    if (error) {
      return next(error);
    } else {
      if (user === null) {
        let err = new Error("Not authorized");
        err.status = 400;
        return next(err);
      } else {
        let delID = req.params.id;
        Movies.deleteOne({ _id: delID }, function(err, movies) {
          if (err) res.send(err);
          res.json({ message: user.email + " deleted movie" });
        });
      }
    }
  });
});
// Log out user
app.get("/api/logout", (req, res, next) => {
  if (req.session) {
    // Delete session
    req.session.destroy(function(err) {
      if (err) {
	res.json({message:"error"});
        return next(err);
      } else {
        return res.json({ message: "logged out" });
      }
    });
  }
});
app.set("port", 8081);
app.listen(app.get("port"), () =>
  console.log("Server started on port " + app.get("port"))
);

