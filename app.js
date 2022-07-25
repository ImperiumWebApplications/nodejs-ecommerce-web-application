const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");

const db = require("./util/connection");
const errorController = require("./controllers/error");

const app = express();

// Configure ejs as the template engine
app.set("view engine", "ejs");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

// Execute the query to select all rows from the products using the connection pool
// Parse and log the results
db.query("SELECT * FROM products")
.then(([results, metadata]) => {
    console.log(results);
})
.catch((err) => {
    console.log(err)
})

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

app.listen(3000);
