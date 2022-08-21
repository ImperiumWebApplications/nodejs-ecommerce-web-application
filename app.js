const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const mongoDBStore = require("connect-mongodb-session")(session);

const errorController = require("./controllers/error");
const User = require("./models/user");

const app = express();

// Configure ejs as the template engine
app.set("view engine", "ejs");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

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

// Find the user in the database and set it as the value for req.user
app.use((req, res, next) => {
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
    // Create a user if not a single one exists
    User.findOne().then((user) => {
      if (!user) {
        const user = new User({
          name: "Test User",
          email: "test@test.com",
          cart: { items: [], totalPrice: 0 },
        });
        user.save();
      }
    });
    console.log("Connected to database");
    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });
