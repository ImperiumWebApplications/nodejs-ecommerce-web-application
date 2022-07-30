const getDB = require("../util/database");
const mongoDB = require("mongodb");

class Product {
  constructor(id, name, price, imageUrl, description) {
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
            return {
              id: product._id,
              name: product.name,
              price: product.price,
              imageUrl: product.imageUrl,
              description: product.description,
            };
          });
        });
    });
  }

  static findById(id) {
    return getDB().then((db) => {
      return db
        .collection("products")
        .find({ _id: new mongoDB.ObjectId(id) })
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
