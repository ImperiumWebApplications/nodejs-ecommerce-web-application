const User = require("../models/user");

exports.getLogin = (req, res, next) => {
  const isLoggedIn = req.headers.cookie
    .split(";")
    .find((c) => c.trim().startsWith("isLoggedIn="))
    ?.split("=")[1];
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    isLoggedIn: req.session.isLoggedIn,
  });
};

exports.postLogin = (req, res, next) => {
  req.session.isLoggedIn = true;
  User.findById("62ea000b02eb456ce65a82f8")
    .then((user) => {
      req.session.user = user;
      res.redirect("/");
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
