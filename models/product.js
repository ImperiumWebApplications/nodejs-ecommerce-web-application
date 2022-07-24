// Import the modules for file handling
const fs = require("fs");
const path = require("path");
const Cart = require("./cart");

// Create a helper method readProductsFromFile() which executes a callback with the products from the file.
const readProductsFromFile = (callback) => {
  fs.readFile(
    path.join(__dirname, "../data/products.json"),
    (err, fileContent) => {
      if (err) {
        callback([]);
      } else {
        callback(JSON.parse(fileContent));
      }
    }
  );
};

class Product {
  constructor(id, title, imageUrl, price, description) {
    this.id = id;
    this.title = title;
    this.imageUrl = imageUrl;
    this.price = price;
    this.description = description;
  }
  save() {
    // Read the contents of the products.json file and parse it into an array
    // Append the new product to the array
    // Write the contents to the products.json file
    if (this.id) {
      readProductsFromFile((products) => {
        const existingProductIndex = products.findIndex(
          (product) => product.id === this.id
        );
        const updatedProducts = [...products];
        updatedProducts[existingProductIndex] = this;
        fs.writeFile(
          path.join(__dirname, "../data/products.json"),
          JSON.stringify(updatedProducts),
          (err) => {
            console.log(err);
          }
        );
      });
    } else {
      this.id = Math.random().toString();
      readProductsFromFile((products) => {
        products.push(this);
        fs.writeFile(
          path.join(__dirname, "../data/products.json"),
          JSON.stringify(products),
          (err) => {
            console.log(err);
          }
        );
      });
    }
  }

  static deleteById(id) {
    readProductsFromFile((products) => {
      const updatedProducts = products.filter((product) => product.id !== id);
      const productPrice = products.find((product) => product.id === id).price;
      fs.writeFile(
        path.join(__dirname, "../data/products.json"),
        JSON.stringify(updatedProducts),
        (err) => {
          Cart.removeProduct(id, productPrice);
          console.log(err);
        }
      );
    });
  }

  // Define getProducts method which returns the products array
  static getProducts(callback) {
    readProductsFromFile(callback);
  }

  static findById(id, callback) {
    readProductsFromFile((products) => {
      const product = products.find((product) => product.id === id);
      callback(product);
    });
  }
}

// Export the class
module.exports = Product;
