const mongodb = require("mongodb");
const getDB = require("../util/database");

class User {
  constructor(name, email, id) {
    this.name = name;
    this.email = email;
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
