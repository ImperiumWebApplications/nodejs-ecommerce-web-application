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
  constructor(title, imageUrl, price, description) {
    this.id = Math.random().toString();
    this.title = title;
    this.imageUrl = imageUrl;
    this.price = price;
    this.description = description;
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
    readProductsFromFile(callback);
  }

  static findById(id, callback) {
    readProductsFromFile((products) => {
      const product = products.find((product) => product.id === id);
      callback(product);
    });
  }

  static addToCart(id, price, title, userId, cartId, callback) {
    readProductsFromFile((products) => {
      const product = products.find((product) => product.id === id);
      if (product) {
        const cart = {
          id: cartId,
          userId: userId,
          products: [
            {
              id: id,
              title: title,
              price: price,
              quantity: 1,
            },
          ],
        };
        fs.readFile(
          path.join(__dirname, "../data/carts.json"),
          (err, fileContent) => {
            if (err) {
              fs.writeFile(
                path.join(__dirname, "../data/carts.json"),
                JSON.stringify([cart]),
                (err) => {
                  console.log(err);
                }
              );
            } else {
              const carts = JSON.parse(fileContent);
              const existingCart = carts.find((cart) => cart.id === cartId);
              if (existingCart) {
                const existingProduct = existingCart.products.find(
                  (product) => product.id === id
                );
                if (existingProduct) {
                  existingProduct.quantity++;
                } else {
                  existingCart.products.push({
                    id: id,
                    title: title,
                    price: price,
                    quantity: 1,
                  });
                }
              } else {
                carts.push(cart);
              }
              fs.writeFile(
                path.join(__dirname, "../data/carts.json"),
                JSON.stringify(carts),
                (err) => {
                  console.log(err);
                }
              );
            }
          }
        );
      }
      callback(product);
    });
  }
}

// Export the class
module.exports = Product;
