const mongoose = require('mongoose')

const Schema = mongoose.Schema

const imageSchema = new Schema({
  // all the products that contains the image
  products: [
    { 
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    }
  ],
  name: String,
  // src and alt are storage in the product for increased performance
  src: {
    type: String,
    required: true
  },
  alt: String
}, { timestamps: true })

imageSchema.statics.updateProductImages = async function (product, newImageIds) {
  if (!newImageIds) return

  const alreadyIncludedIndex = {} // so the already present images dont have to be fetched again
  
  // remove the no longer user
  for (let productImage of product.images || []) {
    if (newImageIds.includes(productImage.id)) {
      alreadyIncludedIndex[productImage.id] = productImage
    } else {
      const imageToUpdate = await this.findById(productImage.id)
      imageToUpdate.products = imageToUpdate.products.filter(productId => productId.toString() != product.id)
      await imageToUpdate.save()
    }
  }

  let toAddImages = []
  for (let newImageId of newImageIds) {
    if (alreadyIncludedIndex[newImageId]) {
      toAddImages.push(alreadyIncludedIndex[newImageId])
    } else {
      let originalImage = await this.findById(newImageId)
      originalImage.products.push(product._id)
      
      await originalImage.save()
      toAddImages.push({
        id: originalImage.id,
        src: originalImage.src,
        alt: originalImage.alt
      })
    }
  }

  product.images = toAddImages
  await product.save()
}

imageSchema.statics.updateImagesData = async function (product, newImageIds) {
  // TODO: visit all the products that are using it (using image.products) and update the fields
}

module.exports = mongoose.model('Image', imageSchema)
