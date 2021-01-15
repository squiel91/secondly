const express = require("express")
const apiController = require("../controllers/api-controller")

const router = express.Router()

router.get("/categories", apiController.getCategories)

module.exports = router
