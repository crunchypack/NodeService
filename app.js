const express = require("express");
const jsonToken = require("jsonwebtoken");

const app = express();

app.get("/api", (req, res) => {
  res.json({ message: "it's Alive!!!" });
});

app.listen(3201, () => console.log("Server started on port 3210"));
