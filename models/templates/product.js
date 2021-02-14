module.exports = product => {
  return {
    id: product.id,
    title: product.title,
    handle: product.handle,
    price: product.price,
    compareAt: product.compareAt,
    stock: product.stock,
    shippingCost: product.shippingCost,
    images: product.imagePaths
  }
}
