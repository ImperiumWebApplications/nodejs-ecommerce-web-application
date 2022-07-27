const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");

const db = require("./util/database");
const errorController = require("./controllers/error");
const Product = require("./models/product");
const User = require("./models/user");

const app = express();

// Configure ejs as the template engine
app.set("view engine", "ejs");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

// Add a new middleware to add the user to the request object
app.use((req, res, next) => {
  User.findByPk(1)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => console.log(err));
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

// A product belongs to a user
Product.belongsTo(User, { constraints: true, onDelete: "CASCADE" });
User.hasMany(Product);

// Sync the database using sequelize
db.sync()
  .then(() => {
    User.findByPk(1)
      .then((user) => {
        if (!user) {
          return User.create({ name: "John", email: "test@test.com" });
        }
        return user;
      })
      .then((user) => {
        console.log("Database synced");
        app.listen(3000);
      })
      .catch((err) => {
        console.log(err);
      });
  })
  .catch((err) => {
    console.log("Error syncing database: " + err);
  });
