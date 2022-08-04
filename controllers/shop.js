const Product = require("../models/product");
const Order = require("../models/order");

exports.getProducts = (req, res, next) => {
  Product.find()
    .then((products) => {
      res.render("shop/product-list", {
        products: products,
        pageTitle: "All Products",
        path: "/products",
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getIndex = (req, res, next) => {
  Product.find()
    .then((data) => {
      res.render("shop/index", {
        products: data,
        pageTitle: "Shop",
        path: "/",
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getCart = (req, res, next) => {
  req.user
    .getCart()
    .then((user) => {
      const cartItems = user.cart.items;
      let totalPrice = user.cart.totalPrice;
      res.render("shop/cart", {
        path: "/cart",
        pageTitle: "Your Cart",
        products: cartItems,
        totalPrice: totalPrice,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

// exports.getCart = (req, res, next) => {
//   // Get the cart associated with the user
//   // The user is available in the request object through req.user
//   // Get the products associated with the cart
//   // Render the cart page
//   req.user
//     .getCart()
//     .then((cart) => {
//       return cart.getProducts();
//     })
//     .then((products) => {
//       res.render("shop/cart", {
//         path: "/cart",
//         pageTitle: "Your Cart",
//         products: products,
//       });
//     })
//     .catch((err) => {
//       console.log(err);
//     });

//   // Cart.getCartItems((cart) => {
//   //   res.render("shop/cart", {
//   //     pageTitle: "Your Cart",
//   //     path: "/cart",
//   //     cart: cart,
//   //   });
//   // });
// };

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then((product) => {
      return req.user.addToCart(product);
    })
    .then(() => {
      res.redirect("/cart");
    })
    .catch((err) => {
      console.log(err);
    });
};

// exports.postCart = (req, res, next) => {
//   const productId = req.body.productId;
//   let fetchedCart;
//   let newQuantity = 1;
//   // Get the cart associated with the user
//   // The user is available in the request object through req.user
//   // Use the cart to get the product with the productId
//   // Add the product to the cart
//   // Redirect to the cart page
//   req.user
//     .getCart()
//     .then((cart) => {
//       fetchedCart = cart;
//       return cart.getProducts({ where: { id: productId } });
//     })
//     .then((products) => {
//       // Find whether the product exists within the cart
//       // If it does, increase the quantity
//       // If it doesn't, add the product to the cart
//       let product;
//       if (products.length > 0) {
//         product = products[0];
//       }
//       if (product) {
//         const oldQuantity = product.cartItem.quantity;
//         newQuantity = oldQuantity + 1;
//         return product;
//       }
//       return Product.findByPk(productId);
//     })
//     .then((product) => {
//       return fetchedCart.addProduct(product, {
//         through: { quantity: newQuantity },
//       });
//     })
//     .then((result) => {
//       res.redirect("/cart");
//     })
//     .catch((err) => {
//       console.log(err);
//     });
// };

exports.postCartDeleteProduct = (req, res, next) => {
  const productId = req.body.productId;
  req.user
    .deleteProductFromCart(productId)
    .then(() => {
      res.redirect("/cart");
    })
    .catch((err) => {
      console.log(err);
    });
};

// exports.getCheckout = (req, res, next) => {
//   res.render("shop/checkout", {
//     pageTitle: "Checkout",
//     path: "/checkout",
//   });
// };

exports.postOrder = (req, res, next) => {
  const order = new Order({
    user: req.user,
    products: req.user.cart.items,
    totalPrice: req.user.cart.totalPrice,
  });
  order
    .save()
    .then(() => {
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect("/orders");
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getOrders = (req, res, next) => {
  Order.find({ user: req.user._id })
    .populate("products.productId")
    .then((orders) => {
      res.render("shop/orders", {
        path: "/orders",
        pageTitle: "Your Orders",
        orders: orders,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

// exports.postCheckout = (req, res, next) => {
//   req.user
//     .getCart()
//     .then(
//       (cart) => {
//         return cart.getProducts();
//       }
//       // Get the products associated with the cart
//       // Create an order
//       // Create an order item for each product
//       // Reduce the quantity of each product
//       // Empty the cart
//     )
//     .then((products) => {
//       return req.user
//         .createOrder()
//         .then(
//           (order) => {
//             return order.addProducts(
//               products.map((product) => {
//                 product.orderItem = { quantity: product.cartItem.quantity };
//                 return product;
//               })
//             );
//           }
//           // Empty the cart
//         )
//         .then(() => {
//           return req.user
//             .getCart()
//             .then(
//               (cart) => {
//                 return cart.setProducts(null);
//               }
//               // Redirect to the orders page
//             )
//             .then(() => {
//               res.redirect("/orders");
//             });
//         });
//     })
//     .catch((err) => {
//       console.log(err);
//     });
// };

// exports.getOrders = (req, res, next) => {
//   req.user
//     .getOrders({ include: ["products"] })
//     .then((orders) => {
//       res.render("shop/orders", {
//         pageTitle: "Orders",
//         path: "/orders",
//         orders: orders,
//       });
//     })
//     .catch((err) => {
//       console.log(err);
//     });
//   // res.render("shop/orders", {
//   //   pageTitle: "Your Orders",
//   //   path: "/orders",
//   // });
// };

exports.getProduct = (req, res, next) => {
  const productId = req.params.productId;
  Product.findById(productId)
    .then(
      (product) => {
        res.render("shop/product-detail", {
          pageTitle: product.title,
          path: "/products",
          product: product,
        });
      }
      // Get the product with the productId
      // Render the product detail page
    )
    .catch(
      (err) => {
        console.log(err);
      }
      // If the product doesn't exist, redirect to the home page
    );
};
