const Sequelize = require("sequelize");
const sequelize = new Sequelize("node-ecommerce", "root", "tiktik123", {
  host: "localhost",
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
