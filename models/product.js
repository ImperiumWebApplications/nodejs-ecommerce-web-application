const getDB = require("../util/database");

class Product {
  constructor(name, price, imageUrl, description) {
    this.name = name;
    this.price = price;
    this.imageUrl = imageUrl;
    this.description = description;
  }

  save() {
    return getDB().then((db) => {
      return db
        .collection("products")
        .insertOne(this)
        .then((result) => {
          this._id = result.insertedId;
          return this;
        });
    });
  }

  static fetchAll() {
    return getDB().then((db) => {
      return db
        .collection("products")
        .find()
        .toArray()
        .then((products) => {
          return products.map((product) => {
            return new Product(
              product.id,
              product.name,
              product.price,
              product.imageUrl,
              product.description
            );
          });
        });
    });
  }

  static findById(id) {
    return getDB().then((db) => {
      return db
        .collection("products")
        .find({ _id: new getDB.ObjectID(id) })
        .next()
        .then((product) => {
          return new Product(
            product.id,
            product.name,
            product.price,
            product.imageUrl,
            product.description
          );
        });
    });
  }
}

module.exports = Product;
