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
