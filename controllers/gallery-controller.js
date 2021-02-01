const multer = require('multer')
const fs = require('fs')

const rootPath = require('../utils/root-path')
const stdRes = require('../utils/standard-response')

const Image = require('../models/Image')

const imageTemplate = require('../models/templates/image')

exports.getGalleryEditor = async (req, res, next) => {
  const images = await Image.find().sort({ createdAt: 'desc' })
  res.render('gallery/gallery.ejs', { images })
}

// Store image with Multer
const fileStorage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'public/gallery')
  },
  filename: (req, file, callback) => {
    callback(null, `${Date.now()}-${file.originalname}`)
  }
})

const fileFilter = (req, file, callback) => {
  callback(null, ['image/png', 'image/jpg', 'image/jpeg'].includes(file.mimetype))
}

exports.saveToFS = multer({ storage: fileStorage, fileFilter }).single('image')

exports.getGallery = async (req, res, next) => {
  try {
    const images = await Image.find().sort({ createdAt: 'asc' })
    return res.json({
      success: true,
      images: images?.map(image => imageTemplate(image))
    })
  } catch (error) { stdRes._500(res, error.message) }
}

exports.postGallery = async (req, res, next) => {
  try {
    if (!req.file) {
      return stdRes._400(res, 'Unsuported type')
    }

    let filePath = req.file.path.replace('public', '')
    filePath = filePath.replace(/\\/g, '/')

    let image = new Image({
      name: req.file.originalname,
      src: filePath
    })

    image = await image.save()
    res.json({ success: true, image: imageTemplate(image) })
  } catch (error) { stdRes._500(res, error.message) }
}

exports.patchGallery = async (req, res, next) => {
  try {
    const populatedImage = await Image.findById(req.params.imageId).populate('products')
    populatedImage.alt = req.body.alt
    populatedImage.name = req.body.name

    for (const product of populatedImage.products) {
      const toUpdateProdImage = product.images.find(
        productImage => productImage.id === populatedImage.id
      )
      toUpdateProdImage.alt = populatedImage.alt
      toUpdateProdImage.name = populatedImage.name
      await product.save()
    }
    await populatedImage.save()

    res.json({ success: true, image: imageTemplate(populatedImage) })
  } catch (error) { stdRes._500(res, error.message) }
}

exports.deleteGallery = async (req, res, next) => {
  try {
    const populatedImage = await Image.findById(req.params.imageId).populate('products')
    for (const product of populatedImage.products) {
      product.images = product.images.filter(productImage => productImage.id !== populatedImage.id)
      await product.save()
    }
    await Image.findByIdAndDelete(req.params.imageId)
    fs.unlink(
      rootPath('public', populatedImage.src),
      error => { if (error) console.log(error) }
    )

    res.json({ success: true })
  } catch (error) { stdRes._500(res, error.message) }
}
