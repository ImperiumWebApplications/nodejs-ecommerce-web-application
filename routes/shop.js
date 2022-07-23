const express = require("express");
const productsData = require("../controllers/products");

const router = express.Router();

router.get("/", productsData.getProducts);

router.get("/products", productsData.getProducts);

router.get('/cart');

router.get('/checkout');

module.exports = router;
