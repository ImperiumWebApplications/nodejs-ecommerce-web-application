const mongooose = require("mongoose");

const orderSchema = new mongooose.Schema({
  user: {
    type: mongooose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  products: [
    {
      productId: {
        type: mongooose.Schema.Types.ObjectId,
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
});

const Order = mongooose.model("Order", orderSchema);

module.exports = Order;
