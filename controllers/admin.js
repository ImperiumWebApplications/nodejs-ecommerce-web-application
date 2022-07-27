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
  // Create the product using the sequelize Product model
  Product.create({
    name: title,
    price: price,
    imageUrl: imageUrl,
    description: description,
  })
    .then((result) => {
      console.log("Created product");
      res.redirect("/admin/products");
    })
    .catch((err) => {
      console.log("Error creating product: " + err);
    });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect("/");
  }

  const productId = req.params.productId;
  Product.findByPk(productId)
    .then((product) => {
      res.render("admin/edit-product", {
        pageTitle: "Edit Product",
        path: "/admin/edit-product",
        editing: editMode,
        product: product,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postEditProduct = (req, res, next) => {
  const productId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedImageUrl = req.body.imageUrl;
  const updatedDescription = req.body.description;
  Product.update(
    {
      name: updatedTitle,
      price: updatedPrice,
      imageUrl: updatedImageUrl,
      description: updatedDescription,
    },
    {
      where: {
        id: productId,
      },
    }
  )
    .then((result) => {
      console.log("Updated product");
      res.redirect("/admin/products");
    })
    .catch((err) => {
      console.log("Error updating product: " + err);
    });
};

exports.getProducts = (req, res, next) => {
  Product.findAll()
    .then((data) => {
      const products = data.map((item) => item.dataValues);
      res.render("admin/products", {
        products: products,
        pageTitle: "Admin Products",
        path: "/admin/products",
      });
    })
    .catch((error) => {
      console.log(error);
    });
};

exports.postDeleteProduct = (req, res, next) => {
  const productId = req.body.productId;
  Product.destroy({
    where: {
      id: productId,
    },
  })
    .then((result) => {
      console.log("Deleted product");
      res.redirect("/admin/products");
    })
    .catch((err) => {
      console.log("Error deleting product: " + err);
    });
};
