const Product = require("../models/product");

exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    activeAddProduct: true,
    editing: false,
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  if (title) {
    const product = new Product(title, imageUrl, price, description);
    product.save();
  }
  res.redirect("/");
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect("/");
  }
  const productId = req.params.productId;
  Product.findById(productId, (product) => {
    if (!product) {
      return res.redirect("/");
    }

    res.render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: "/admin/edit-product",
      editing: editMode,
      product: product,
    });
  });
};

exports.postEditProduct = (req, res, next) => {
  const productId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedImageUrl = req.body.imageUrl;
  const updatedDescription = req.body.description;
  Product.findById(productId, (product) => {
    if (product.title !== updatedTitle) {
      product.title = updatedTitle;
    }
    if (product.price !== updatedPrice) {
      product.price = updatedPrice;
    }
    if (product.imageUrl !== updatedImageUrl) {
      product.imageUrl = updatedImageUrl;
    }
    if (product.description !== updatedDescription) {
      product.description = updatedDescription;
    }
    const updatedProduct = new Product(
      productId,
      product.title,
      product.imageUrl,
      product.price,
      product.description
    );

    updatedProduct.update(productId);
  });
  res.redirect("/admin/products");
};

exports.getProducts = (req, res, next) => {
  Product.getProducts((products) => {
    res.render("admin/products", {
      products: products,
      pageTitle: "Admin Products",
      path: "/admin/products",
    });
  });
};
