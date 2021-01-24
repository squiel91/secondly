const express = require("express");

const router = express.Router();

const storeController = require("../controllers/store-controller");

router.get("/", storeController.getHomepage);
router.get("/products/:productId", storeController.getProductDetails);
router.get("/cart", storeController.getCart);
router.get("/cart/shipping", storeController.getCartShipping);
router.get("/cart/checkout/success", storeController.getCheckoutSuccess);
router.get("/cart/checkout/fail", storeController.getCheckoutFail);
router.get("/orders", storeController.getOrders);
router.get("/pages/:pageHandle", storeController.getPage);
router.get("/categories", storeController.getCategories);
router.get("/categories/:categoryHandle", storeController.getCategory);

router.post("/cart", storeController.postCart);
router.post("/cart/shipping", storeController.postCartShipping);
router.post("/cart/checkout", storeController.postCheckout);

// Search
router.get("/search", storeController.getSearch);

// API
router.post("/subscribe", storeController.postSubscribe); // could be move to api routes
// router.patch('/cart', storeController.patchCart)

module.exports = router;
