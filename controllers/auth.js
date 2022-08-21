const User = require("../models/user");

exports.getLogin = (req, res, next) => {
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    isLoggedIn: req.session.isLoggedIn,
  });
};

exports.getSignup = (req, res, next) => {
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    isLoggedIn: req.session.isLoggedIn,
  });
};

exports.postSignUp = (req, res, next) => {}


exports.postLogin = (req, res, next) => {
  req.session.isLoggedIn = true;
  User.findById("62ea000b02eb456ce65a82f8")
    .then((user) => {
      req.session.user = user;
      req.session.save((err) => {
        res.redirect("/");
        // console.log(err);
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
  });
  res.redirect("/");
};
