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
    return getDB().then((db) => {
      return db
        .collection("users")
        .updateOne(
          { _id: new mongodb.ObjectId(this.id) },
          { $push: { cart: { productId: product.id, quantity: 1 } } }
        );
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
