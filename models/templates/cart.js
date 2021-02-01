// TODO: doesnt make sense
module.exports = cart => {
  return [{
    product: {
      id: cart.product.id,
      title: cart.product.title,
      price: cart.product.price,
      stock: cart.product.stock,
      shippingCost: cart.product.shippingCost,
      imagePaths: cart.product.imagePaths
    },
    quantity: cart.newQuantity
  }]
}
