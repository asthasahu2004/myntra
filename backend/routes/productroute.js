const express = require('express');
const { createProduct, imagekits, getallproducts, SendSingleProduct, getBatchProducts } = require('../controller/productcontroller');
const route = express.Router();

route.post('/create_product', createProduct)
route.get('/get', imagekits)
route.get('/products', getallproducts)
route.post('/products/batch', getBatchProducts)
route.get('/products/:id',SendSingleProduct)

module.exports = route