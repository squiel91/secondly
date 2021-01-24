const express = require("express")

const galleryController = require("../controllers/gallery-controller")

const router = express.Router()

router.get("/galleryDemo", galleryController.getGalleryDemo)
router.get("/gallery", galleryController.getGallery)
router.post("/gallery", galleryController.saveToFS, galleryController.postGallery)
router.patch("/gallery/:imageId", galleryController.patchGallery)
router.delete("/gallery/:imageId", galleryController.deleteGallery)

module.exports = router
