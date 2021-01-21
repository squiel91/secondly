const express = require("express")
const galleryController = require("../controllers/gallery-controller")
const upload = require('../upload/index')
const router = express.Router()


router.get("/gallery", galleryController.getGallery)
router.post("/gallery", upload, galleryController.postGallery)
router.patch("/:id", galleryController.patchGallery)
router.delete("/:id", galleryController.deleteGallery)

module.exports = router
