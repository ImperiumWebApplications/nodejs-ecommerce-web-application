const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255,
  },
  email: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255,
  },
  cart: {
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
      },
    ],
    totalPrice: {
      type: Number,
      required: true,
    },
  },
});

// Add to cart method for the userSchema
userSchema.methods.addToCart = function (product) {
  const cartProductIndex = this.cart.items.findIndex((cp) => {
    return cp.productId.toString() === product._id.toString();
  });
  let newQuantity = 1;
  const updatedCartItems = [...this.cart.items];
  if (cartProductIndex >= 0) {
    newQuantity = this.cart.items[cartProductIndex].quantity + 1;
    updatedCartItems[cartProductIndex].quantity = newQuantity;
  } else {
    updatedCartItems.push({
      productId: product._id,
      quantity: newQuantity,
    });
  }
  const updatedCart = {
    items: updatedCartItems,
    totalPrice: this.cart.totalPrice + product.price,
  };
  this.cart = updatedCart;
  return this.save();
};

// Get cart method for the userSchema
userSchema.methods.getCart = function () {
  return this.populate("cart.items.productId");
};

// Delete product from cart method for the userSchema
userSchema.methods.deleteProductFromCart = function (productId) {
  // Populate cart.items.productId and get the price of the product with the id productId
  return this.populate("cart.items.productId").then((user) => {
    const cartProduct = user.cart.items.find((cp) => {
      return cp.productId._id.toString() === productId.toString();
    });

    if (!cartProduct) {
      return;
    }
    const newCartItems = user.cart.items
      .filter((cp) => {
        return cp.productId._id.toString() !== productId.toString();
      })
      .map((cp) => {
        return { productId: cp.productId._id, quantity: cp.quantity };
      });
    const newCart = {
      items: newCartItems,
      totalPrice: user.cart.totalPrice - cartProduct.productId.price,
    };
    user.cart = newCart;
    return user.save();
  });
};

const User = mongoose.model("User", userSchema);
module.exports = User;
