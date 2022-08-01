const mongodb = require("mongodb");
const getDB = require("../util/database");

class User {
  constructor(name, email, cart, id) {
    this.name = name;
    this.email = email;
    this.cart = cart;
    this.id = id;
  }

  save() {
    return getDB().then((db) => {
      const user = {
        name: this.name,
        email: this.email,
      };
      return db
        .collection("users")
        .insertOne(user)
        .then((result) => {
          this.id = result.insertedId;
          return this;
        });
    });
  }

  addToCart(product) {
    // If the product is already in the cart, increase the quantity
    const cartProductIndex = this.cart.items.findIndex(
      (cp) => cp.productId.toString() === product.id.toString()
    );
    let updatedCartItems;
    if (cartProductIndex >= 0) {
      // Increase the quantity of the product in the cart
      const updatedCartItem = { ...this.cart.items[cartProductIndex] };
      updatedCartItem.quantity++;
      updatedCartItems = [...this.cart.items];
      updatedCartItems[cartProductIndex] = updatedCartItem;
    }
    // If the product is not in the cart, add it to the cart
    else {
      updatedCartItems = [
        ...this.cart.items,
        { productId: product.id, quantity: 1 },
      ];
    }
    const updatedCart = {
      items: updatedCartItems,
      totalPrice: this.cart.totalPrice + +product.price,
    };
    return getDB().then((db) => {
      return db
        .collection("users")
        .updateOne(
          { _id: new mongodb.ObjectId(this.id) },
          { $set: { cart: updatedCart } }
        );
    });
  }

  getCart() {
    return getDB().then((db) => {
      return db
        .collection("users")
        .findOne({ _id: new mongodb.ObjectId(this.id) })
        .then((user) => {
          this.cart = user.cart;
          return db.collection("products").find({
            _id: { $in: user.cart.items.map((i) => i.productId) },
          });
        })
        .then((products) => {
          return products.toArray();
        })
        .then((items) => {
          return items.map((item) => {
            return {
              ...item,
              quantity: this.cart.items.find(
                (i) => i.productId.toString() === item._id.toString()
              ).quantity,
            };
          });
        })
        .then((items) => {
          this.cart.items = items;
          return this.cart;
        });
    });
  }

  deleteItemFromCart(productId) {
    const updatedCartItems = this.cart.items.filter(
      (item) => item.productId.toString() !== productId.toString()
    );
    const updatedCart = {
      items: updatedCartItems,
      totalPrice:
        this.cart.totalPrice -
        this.cart.items.find(
          (item) => item.productId.toString() === productId.toString()
        ).quantity *
          this.cart.items.find(
            (item) => item.productId.toString() === productId.toString()
          ).price,
    };
    return getDB().then((db) => {
      return db
        .collection("users")
        .updateOne(
          { _id: new mongodb.ObjectId(this.id) },
          { $set: { cart: updatedCart } }
        );
    });
  }

  addOrder() {
    return getDB().then((db) => {
      return db
        .collection("orders")
        .insertOne({ items: this.cart.items, userId: this.id })
        .then((result) => {
          this.cart = { items: [], totalPrice: 0 };
          return db
            .collection("users")
            .updateOne(
              { _id: new mongodb.ObjectId(this.id) },
              { $set: { cart: this.cart } }
            );
        });
    });
  }

  static findById(id) {
    return getDB().then((db) => {
      return db
        .collection("users")
        .findOne({ _id: mongodb.ObjectId(id) })
        .then((user) => {
          return user;
        });
    });
  }

  static fetchAll() {
    return getDB().then((db) => {
      return db.collection("users").find().toArray();
    });
  }
}

module.exports = User;
