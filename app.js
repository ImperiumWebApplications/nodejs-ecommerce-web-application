const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const errorController = require("./controllers/error");
// const User = require("./models/userMongoDB");

const app = express();

// Configure ejs as the template engine
app.set("view engine", "ejs");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

// Find the user in the database and set it as the value for req.user
// app.use((req, res, next) => {
//   User.findById("62e5f435347621d42f3000e0")
//     .then((user) => {
//       req.user = new User(user.name, user.email, user.cart, user._id);
//       next();
//     })
//     .catch((err) => {
//       console.log(err);
//     });
// });

app.use("/admin", adminRoutes);
app.use(shopRoutes);

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
