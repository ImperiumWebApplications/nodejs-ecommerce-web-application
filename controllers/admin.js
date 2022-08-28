const { validationResult } = require("express-validator");
const Product = require("../models/product");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    activeAddProduct: true,
    editing: false,
    errorMessage: "",
    product: {
      title: "",
      price: "",
      description: "",
      imageUrl: "",
    },
    validationErrors: [],
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const image = req.file;
  const price = req.body.price;
  const description = req.body.description;
  const errors = validationResult(req);

  if (!image) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      activeAddProduct: true,
      editing: false,
      errorMessage: "Attached file is not an image.",
      product: {
        title: title,
        price: price,
        description: description,
      },
      validationErrors: [],
    });
  }
  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      activeAddProduct: true,
      editing: false,
      product: {
        title: title,
        price: price,
        description: description,
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }

  // Product is a mongoose model
  // Use the mongoose model methods to create a product
  Product.create({
    title: title,
    price: price,
    description: description,
    imageUrl: "/images/" + image.filename,
    userId: req.user,
  })
    .then((newProduct) => {
      res.redirect("/admin/products");
    })
    .catch((err) => {
      return next(err);
    });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect("/");
  }
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then((product) => {
      res.render("admin/edit-product", {
        pageTitle: "Edit Product",
        path: "/admin/edit-product",
        editing: editMode,
        product: product,
        activeAddProduct: true,
        errorMessage: "",
        validationErrors: [],
      });
    })
    .catch((err) => {
      return next(err);
    });
};

// const productId = req.params.productId;
// req.user
//   .getProducts({ where: { id: productId } })
//   .then((products) => {
//     const product = products[0];
//     res.render("admin/edit-product", {
//       pageTitle: "Edit Product",
//       path: "/admin/edit-product",
//       editing: editMode,
//       product: product,
//       activeAddProduct: true,
//     });
//   })
//   .catch((err) => {
//     console.log(err);
//   });

// Product.findByPk(productId)
//   .then((product) => {
//     res.render("admin/edit-product", {
//       pageTitle: "Edit Product",
//       path: "/admin/edit-product",
//       editing: editMode,
//       product: product,
//     });
//   })
//   .catch((err) => {
//     console.log(err);
//   });
// };

exports.postEditProduct = (req, res, next) => {
  const productId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedImage = req.file;
  const updatedDescription = req.body.description;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: "/admin/edit-product",
      editing: true,
      product: {
        title: updatedTitle,
        price: updatedPrice,
        imageUrl: updatedImage,
        description: updatedDescription,
        id: productId,
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }

  Product.findById(productId)
    .then((product) => {
      const imageUrl = product.imageUrl;
      if (updatedImage) {
        fs.unlink(path.join(__dirname, "..", imageUrl), (err) => {
          if (err) {
            console.log(err);
          }
        });
      }
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.description = updatedDescription;
      if (updatedImage) {
        product.imageUrl = "/images/" + updatedImage.filename;
      }
      return product.save();
    })
    .then(() => {
      return res.redirect("/admin/products");
    })

    .catch((err) => {
      console.log(err);
    });
};

exports.getProducts = (req, res, next) => {
  // Use find method on the product model to get all the products
  // Populate the userId for each product with the user's details
  Product.find()
    // .populate("userId", "name")
    .then(
      (products) => {
        res.render("admin/products", {
          products: products,
          pageTitle: "Admin Products",
          path: "/admin/products",
          activeProducts: true,
        });
      }
      // Render the products page with the products
    )
    .catch(
      (err) => {
        return next(err);
      }
      // Log the error
    );
};

exports.postDeleteProduct = (req, res, next) => {
  const productId = req.body.productId;

  Product.findById(productId)
    .then((product) => {
      if (product.userId.toString() !== req.user._id.toString()) {
        return res.redirect("/");
      }
      const imageUrl = product.imageUrl;
      fs.unlink(path.join(__dirname, "..", imageUrl), (err) => {
        if (err) {
          console.log(err);
        }
      });
      Product.findByIdAndDelete(productId)
        .then(() => {
          res.redirect("/admin/products");
        })
        .catch((err) => {
          return next(err);
        });
    })
    .catch((err) => {
      return next(err);
    });
};
