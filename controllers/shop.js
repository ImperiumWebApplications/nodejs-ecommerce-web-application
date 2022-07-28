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
  let fetchedCart;
  let newQuantity = 1;
  // Get the cart associated with the user
  // The user is available in the request object through req.user
  // Use the cart to get the product with the productId
  // Add the product to the cart
  // Redirect to the cart page
  req.user
    .getCart()
    .then((cart) => {
      fetchedCart = cart;
      return cart.getProducts({ where: { id: productId } });
    })
    .then((products) => {
      // Find whether the product exists within the cart
      // If it does, increase the quantity
      // If it doesn't, add the product to the cart
      let product;
      if (products.length > 0) {
        product = products[0];
      }
      if (product) {
        const oldQuantity = product.cartItem.quantity;
        newQuantity = oldQuantity + 1;
        return product;
      }
      return Product.findByPk(productId);
    })
    .then((product) => {
      return fetchedCart.addProduct(product, {
        through: { quantity: newQuantity },
      });
    })
    .then((result) => {
      res.redirect("/cart");
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const productId = req.body.productId;
  req.user
    .getCart()
    .then((cart) => {
      return cart.getProducts({ where: { id: productId } });
    })
    .then((products) => {
      const product = products[0];
      return product.cartItem.destroy();
    })
    .then(() => {
      res.redirect("/cart");
    })
    .catch((err) => {
      console.log(err);
    });
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
