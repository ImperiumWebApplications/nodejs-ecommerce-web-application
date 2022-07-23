// Import the modules for file handling
const fs = require("fs");
const path = require("path");

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
  constructor(title) {
    this.title = title;
  }
  save() {
    // Read the contents of the products.json file and parse it into an array
    // Append the new product to the array
    // Write the contents to the products.json file
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
  // Define getProducts method which returns the products array
  static getProducts(callback) {
    readProductsFromFile(callback)
  }
}

// Export the class
module.exports = Product;