const Product = require("../models/product");
const Order = require("../models/order");
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
const dotenv = require("dotenv");
dotenv.config();

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const ITEMS_PER_PAGE = 2;

exports.getProducts = (req, res, next) => {
  const page = req.query.page || 1;
  Product.find()
    .countDocuments()
    .then((totalProducts) => {
      Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE)
        .then((products) => {
          res.render("shop/product-list", {
            products: products,
            pageTitle: "All Products",
            path: "/products",
            csrfToken: req.csrfToken(),
            currentPage: page,
            hasNextPage: ITEMS_PER_PAGE * page < totalProducts,
            hasPreviousPage: page > 1,
            nextPage: parseInt(page) + 1,
            previousPage: parseInt(page) - 1,
            lastPage: Math.ceil(totalProducts / ITEMS_PER_PAGE),
          });
        })
        .catch((err) => {
          return next(err);
        });
    })
    .catch((err) => {
      return next(err);
    });
};

exports.getIndex = (req, res, next) => {
  const page = req.query.page || 1;

  Product.find()
    .countDocuments()
    .then((totalProducts) => {
      Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE)
        .then((data) => {
          res.render("shop/index", {
            products: data,
            pageTitle: "Shop",
            path: "/",
            csrfToken: req.csrfToken(),
            currentPage: page,
            hasNextPage: ITEMS_PER_PAGE * page < totalProducts,
            hasPreviousPage: page > 1,
            nextPage: parseInt(page) + 1,
            previousPage: parseInt(page) - 1,
            lastPage: Math.ceil(totalProducts / ITEMS_PER_PAGE),
          });
        })
        .catch((err) => {
          return next(err);
        });
    })
    .catch((err) => {
      return next(err);
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
      return next(err);
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
//       return next(err)
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
      return next(err);
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
//       return next(err)
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
      return next(err);
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
      return next(err);
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
      return next(err);
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
//       return next(err)
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
//       return next(err)
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
        return next(err);
      }
      // If the product doesn't exist, redirect to the home page
    );
};

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;
  Order.findById(orderId)
    // Populate the productIDs with the products
    .populate("products.productId")
    .then((order) => {
      if (!order) {
        return next(new Error("No order found."));
      }
      if (order.user.toString() !== req.user._id.toString()) {
        return next(new Error("Unauthorized"));
      }
      const invoiceName = "invoice-" + orderId + ".pdf";
      const invoicePath = path.join("data", "invoices", invoiceName);
      // Use pdfkit to generate the invoice PDF
      // Populate the porudctID for each order
      const pdfDoc = new PDFDocument();
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "inline; filename=" + invoiceName);
      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      pdfDoc.pipe(res);
      pdfDoc.fontSize(26).text("Invoice", {
        underline: true,
      });
      pdfDoc.text("--------------------");
      let totalPrice = 0;
      order.products.forEach((product) => {
        totalPrice += product.quantity * product.productId.price;
        pdfDoc
          .fontSize(14)
          .text(
            product.productId.title +
              " - " +
              product.quantity +
              " x " +
              product.productId.price
          );
      });
      pdfDoc.text("---");
      pdfDoc.fontSize(20).text("Total Price: $" + totalPrice);
      pdfDoc.end();
    });
};

exports.getCheckout = (req, res, next) => {
  req.user
    .getCart()
    .then((user) => {
      const cartItems = user.cart.items;
      let totalPrice = user.cart.totalPrice;
      res.render("shop/checkout", {
        path: "/checkout",
        pageTitle: "Checkout",
        products: cartItems,
        totalSum: totalPrice,
      });
    })
    .catch((err) => {
      return next(err);
    });
};

exports.postCheckout = (req, res, next) => {
  let cartItems;
  let totalPrice;

  req.user.getCart().then((user) => {
    cartItems = user.cart.items;
    totalPrice = user.cart.totalPrice;
    stripe.checkout.sessions
      .create({
        payment_method_types: ["card"],
        line_items: cartItems.map(
          (cartItem) => {
            return {
              name: cartItem.productId.title,
              description: cartItem.productId.description,
              amount: cartItem.productId.price * 100,
              currency: "usd",
              quantity: cartItem.quantity,
            };
          }
          // Create an array of line items
          // Each line item has a name, description, amount, currency, quantity
        ),
        success_url:
          req.protocol + "://" + req.get("host") + "/checkout/success",
        cancel_url: req.protocol + "://" + req.get("host") + "/checkout/cancel",
      })
      .then((session) => {
        return res.redirect(session.url);
      })
      // Create a checkout session
      // Render the checkout page with the session ID

      .catch(
        (err) => {
          return next(err);
        }
        // If there is an error, redirect to the home page
      );
  });

  // res.redirect(303, session.url);
};

exports.getCheckoutSucceeded = (req, res, next) => {
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
      return next(err);
    });
};
