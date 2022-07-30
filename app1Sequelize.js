const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");

const db = require("./util/database");
const errorController = require("./controllers/error");
const Product = require("./models/product");
const User = require("./models/user");
const Cart = require("./models/cart");
const CartItem = require("./models/cart-item");
const Order = require("./models/order");
const OrderItem = require("./models/order-item");

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

// Products are added to a cart
Product.belongsToMany(Cart, {
  through: CartItem,
  constraints: true,
  onDelete: "CASCADE",
});
Cart.belongsToMany(Product, {
  through: CartItem,
  constraints: true,
  onDelete: "CASCADE",
});

// A cart belongs to a user
Cart.belongsTo(User, { constraints: true, onDelete: "CASCADE" });
User.hasOne(Cart);

// A cart item belongs to a cart
CartItem.belongsTo(Cart, { constraints: true, onDelete: "CASCADE" });
Cart.hasMany(CartItem);

// Order related relations
Order.belongsTo(User, { constraints: true, onDelete: "CASCADE" });
User.hasMany(Order);
Order.belongsTo(Cart, { constraints: true, onDelete: "CASCADE" });
Cart.belongsTo(Order);
Order.belongsToMany(Product, {
  through: OrderItem,
  constraints: true,
  onDelete: "CASCADE",
});
Product.belongsToMany(Order, {
  through: OrderItem,
  constraints: true,
  onDelete: "CASCADE",
});

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
        // Create the cart for the user
        return user.createCart();
      })
      .then((cart) => {
        app.listen(3000);
      })
      .catch((err) => {
        console.log(err);
      });
  })
  .catch((err) => {
    console.log("Error syncing database: " + err);
  });
