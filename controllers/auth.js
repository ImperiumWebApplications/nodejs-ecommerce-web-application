const User = require("../models/user");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const { validationResult } = require("express-validator");

const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  auth: {
    user: "verner.bashirian20@ethereal.email",
    pass: "AD8K9kt911Ta9Ed3As",
  },
});

exports.getLogin = (req, res, next) => {
  const errorMessage = req.flash("error");
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    errorMessage: errorMessage,
    oldInput: {
      email: "",
      password: "",
    },
    validationErrors: [],
  });
};

exports.getSignup = (req, res, next) => {
  const errorMessage = req.flash("error");
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    errorMessage: errorMessage,
    oldInput: {
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationErrors: [],
  });
};

exports.getReset = (req, res, next) => {
  const errorMessage = req.flash("error");
  res.render("auth/reset", {
    path: "/reset",
    pageTitle: "Reset Password",
    errorMessage: errorMessage,
  });
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  const errorMessage = req.flash("error");
  User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
    .then((user) => {
      if (user) {
        return res.render("auth/new-password", {
          path: "/new-password",
          pageTitle: "New Password",
          passwordToken: token,
          errorMessage: errorMessage,
          userId: user._id.toString(),
          token: token,
        });
      }
      req.flash("error", "Password reset token is invalid or has expired");
      return res.redirect("/reset");
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.token;
  let resetUser;
  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId,
  })
    .then((user) => {
      if (!user) {
        req.flash("error", "Password reset token is invalid or has expired");
        return res.redirect("/reset");
      }
      resetUser = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then((hashedPassword) => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save();
    })
    .then((result) => {
      res.redirect("/login");
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postSignUp = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/signup", {
      path: "/signup",
      pageTitle: "Signup",
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
        password: password,
        confirmPassword: confirmPassword,
      },
      validationErrors: errors.array(),
    });
  }

  bcrypt
    .hash(password, 12)
    .then((hashedPassword) => {
      const user = new User({
        email: email,
        password: hashedPassword,
        cart: { items: [], totalPrice: 0 },
      });
      return user.save();
    })
    .then((result) => {
      transporter
        .sendMail({
          to: email,
          from: "email: something@yopmail.com",
          subject: "Signup succeeded",
          html: "<h1>You successfully signed up!</h1>",
        })
        .then((result) => {
          res.redirect("/login");
        })
        .catch((err) => {
          console.log(err);
        });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  const errors = validationResult(req);
  const validationErrors = errors.array();
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/login", {
      path: "/login",
      pageTitle: "Login",
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
        password: password,
      },
      validationErrors: validationErrors,
    });
  }

  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        req.flash("error", "Invalid email or password");
        return res.redirect("/login");
      }

      bcrypt
        .compare(password, user.password)
        .then((doMatch) => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save((err) => {
              res.redirect("/");
            });
          }
          req.flash("error", "Password incorrect");
          return res.redirect("/login");
        })
        .catch((err) => {
          console.log(err);
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

exports.postReset = (req, res, next) => {
  // Send a token to the user's email
  // To generate the token, use the library crypto
  const email = req.body.email;
  const token = crypto.randomBytes(20).toString("hex");
  const now = new Date();
  const expires = new Date(now.getTime() + 3600000); // 1 hour from now
  console.log(token);
  console.log(expires);
  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        req.flash("error", "No account with that email found");
        return res.redirect("/reset");
      }
      user.resetToken = token;
      user.resetTokenExpiration = expires;
      return user.save();
    })
    .then((result) => {
      transporter
        .sendMail({
          to: email,
          from: "somethingElse@yopmail.com",
          subject: "Password reset",
          html: `<p>You requested a password reset</p>
          <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password</p>`,
        })
        .then((result) => {
          req.flash("success", "Email sent");
          return res.redirect("/login");
        })
        .catch((err) => {
          console.log(err);
        });
    })
    .catch((err) => {
      console.log(err);
    });
};
