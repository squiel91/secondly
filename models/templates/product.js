module.exports = product => {
  return {
    id: product.id,
    title: product.title,
    price: product.price,
    compareAt: product.compareAt,
    stock: product.stock,
    shippingCost: product.shippingCost,
    publish: product.publish,
    images: product.imagePaths
  }
}
