require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect("mongodb://localhost:27017/secretsDB");

const userSchema = mongoose.Schema({
  email: String,
  password: String,
});

const userModel = new mongoose.model("user", userSchema);

app.get("/", function (req, res) {
  res.render("home");
});

app.get("/login", function (req, res) {
  res.render("login");
});

app.get("/register", function (req, res) {
  res.render("register");
});

app.post("/register", function (req, res) {
  const userEmail = req.body.email;
  bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
    const user = new userModel({
      email: userEmail,
      password: hash,
    });

    user.save().then(() => {
      res.render("secrets");
    });
  });
});

app.post("/login", function (req, res) {
  const userEmail = req.body.email;
  const userPass = req.body.password;

  userModel
    .findOne({
      email: userEmail,
    })
    .then((doc) => {
      if (doc) {
        bcrypt.compare(userPass, doc.password, function (err, result) {
          if (result === true) {
            res.render("secrets");
          } else {
            res.redirect("/login");
          }
        });
      }
    });
});

const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log(`Server listening on port ${port}`);
});
