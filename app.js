const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const csurf = require("csurf");
const flash = require("connect-flash");
const mongoDBStore = require("connect-mongodb-session")(session);

const errorController = require("./controllers/error");
const User = require("./models/user");

const app = express();

// Configure ejs as the template engine
app.set("view engine", "ejs");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");
const dotenv = require("dotenv");
dotenv.config();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    store: new mongoDBStore({
      uri: "mongodb+srv://root:tiktik123@cluster0.lhsfo.mongodb.net/?retryWrites=true&w=majority",
      collection: "sessions",
    }),
  })
);

// Connect Flash configuration
app.use(flash());


// Csurf middleware
app.use(csurf());
app.use((req, res, next) => {
  res.locals.isLoggedIn = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

// Find the user in the database and set it as the value for req.user
app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => {
      console.log(err);
    });
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

mongoose
  .connect(
    "mongodb+srv://root:tiktik123@cluster0.lhsfo.mongodb.net/?retryWrites=true&w=majority",
    { useNewUrlParser: true }
  )
  .then(() => {
    console.log("Connected to database");
    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });
