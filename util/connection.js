// Export a method which exports a connection pool using mysql2
const mysql2 = require("mysql2");

const pool = mysql2.createPool({
  host: "127.0.0.1",
  user: "root",
  password: "tiktik123",
  database: "node-ecommerce",
});

module.exports = pool.promise();
