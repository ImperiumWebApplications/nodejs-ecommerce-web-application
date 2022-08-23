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
  // Product is a mongoose model
  // Use the mongoose model methods to create a product
  Product.create({
    title: title,
    price: price,
    description: description,
    imageUrl: imageUrl,
    userId: req.user,
  })
    .then((newProduct) => {
      res.redirect("/admin/products");
    })
    .catch((err) => {
      console.log(err);
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
      });
    })
    .catch((err) => {
      console.log(err);
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
  const updatedImageUrl = req.body.imageUrl;
  const updatedDescription = req.body.description;

  Product.findByIdAndUpdate(productId, {
    title: updatedTitle,
    price: updatedPrice,
    description: updatedDescription,
    imageUrl: updatedImageUrl,
  })
    .then(
      (product) => {
        res.redirect("/admin/products");
      }
      // Update the product with the productId

      // Redirect to the admin/products page
    )
    .catch(
      (err) => {
        console.log(err);
      }
      // Log the error
    );
};

exports.getProducts = (req, res, next) => {
  // Use find method on the product model to get all the products
  // Populate the userId for each product with the user's details
  Product.find({
    userId: req.user._id,
  })
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
        console.log(err);
      }
      // Log the error
    );
};

exports.postDeleteProduct = (req, res, next) => {
  const productId = req.body.productId;
  Product.deleteOne({ _id: productId })
    .then(
      () => {
        res.redirect("/admin/products");
      }
      // Delete the product with the productId
    )
    .catch(
      (err) => {
        console.log(err);
      }
      // Log the error
    );
};
