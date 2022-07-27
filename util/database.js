const Sequelize = require("sequelize");
const sequelize = new Sequelize("node-ecommerce", "root", "tiktik123", {
  host: "127.0.0.1",
  dialect: "mysql",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

// Export the connection for other files to use
module.exports = sequelize;
