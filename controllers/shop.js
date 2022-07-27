const Product = require("../models/product");
const Cart = require("../models/cart");
const CartItem = require("../models/cart-item");

exports.getProducts = (req, res, next) => {
  Product.findAll()
    .then((data) => {
      const products = data.map((item) => item.dataValues);
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
  Product.findAll()
    .then((data) => {
      const products = data.map((item) => item.dataValues);
      res.render("shop/index", {
        products: products,
        pageTitle: "Shop",
        path: "/",
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getCart = (req, res, next) => {
  // Get the cart associated with the user
  // The user is available in the request object through req.user
  // Get the products associated with the cart
  // Render the cart page
  req.user
    .getCart()
    .then((cart) => {
      return cart.getProducts();
    })
    .then((products) => {
      console.log('products', products);
      res.render("shop/cart", {
        path: "/cart", 
        pageTitle: "Your Cart",
        products: products,
      });
    })
    .catch((err) => {
      console.log(err);
    });

  // Cart.getCartItems((cart) => {
  //   res.render("shop/cart", {
  //     pageTitle: "Your Cart",
  //     path: "/cart",
  //     cart: cart,
  //   });
  // });
};

exports.postCart = (req, res, next) => {
  const productId = req.body.productId;
  Product.findById(productId, (product) => {
    Cart.addProduct(product);
  });
  res.redirect("/cart");
};

exports.postCartDeleteProduct = (req, res, next) => {
  const productId = req.body.productId;
  Product.findById(productId, (product) => {
    Cart.removeProduct(productId, product.price);
  });
  res.redirect("/cart");
};

exports.getCheckout = (req, res, next) => {
  res.render("shop/checkout", {
    pageTitle: "Checkout",
    path: "/checkout",
  });
};

exports.getOrders = (req, res, next) => {
  res.render("shop/orders", {
    pageTitle: "Your Orders",
    path: "/orders",
  });
};

exports.getProduct = (req, res, next) => {
  const productId = req.params.productId;
  Product.findByPk(productId)
    .then((product) => {
      res.render("shop/product-detail", {
        product: product,
        pageTitle: product.name,
        path: "/products",
      });
    })
    .catch((err) => {
      console.log(err);
    });
};
