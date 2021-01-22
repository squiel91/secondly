const express = require("express")
const galleryController = require("../controllers/gallery-controller")
const upload = require('../upload/index')
const router = express.Router()


router.get("/gallery", galleryController.getGallery)
router.post("/gallery", upload, galleryController.postGallery)
router.patch("/:imageId", galleryController.patchGallery)
router.delete("/:imageId", galleryController.deleteGallery)

module.exports = router
