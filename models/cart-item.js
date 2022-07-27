const Sequelize = require("sequelize");
const database = require("../util/database");

const CartItem = database.define("cartItem", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  },
  quantity: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 1,
  }
});

module.exports = CartItem;
