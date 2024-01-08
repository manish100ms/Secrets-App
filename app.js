require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect("mongodb://localhost:27017/secretsDB");

const userSchema = mongoose.Schema({
  email: String,
  password: String,
});
// Make sure to do this before Model and after Schema
userSchema.plugin(encrypt, {
  secret: process.env.SECRET,
  encryptedFields: ["password"],
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
  const userPass = req.body.password;

  const user = new userModel({
    email: userEmail,
    password: userPass,
  });

  user.save().then(() => {
    res.render("secrets");
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
        if (doc.password === userPass) res.render("secrets");
        else res.redirect("/login");
      }
    });
});

const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log(`Server listening on port ${port}`);
});
