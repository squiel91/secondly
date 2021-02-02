const productTemplate = require('./product')

module.exports = cart => {
  const subtotal = cart.reduce((accum, item) => item.product.price * item.quantity + accum, 0)
  const shippingCost = cart.reduce((accum, item) => item.product.shippingCost * item.quantity + accum, 0)

  return {
    subtotal,
    shippingCost,
    total: subtotal + shippingCost,
    items: cart.map(item => {
      return {
        product: productTemplate(item.product),
        quantity: item.quantity
      }
    })
  }
}
