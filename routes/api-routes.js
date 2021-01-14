const express = require("express");

const router = express.Router();

const apiController = require("../controllers/api-controller");

router.get("/categories", apiController.getCategories);

module.exports = router;
