const SessionCart = require('./SessionCart')

class Cart {
  constructor (req) {
    if (this.user) {
      this.user = req.user
    } else {
      this.sessionCart = SessionCart.load(req.session)
    }
  }

  async get () {
    if (this.user) {
      return new Promise((resolve, reject) => {
        this.user.populate('cart.product')
          .then(populatedUserCart => {
            resolve(populatedUserCart.cart)
          })
          .catch(error => {
            reject(error)
          })
      })
    } else {
      return this.sessionCart.getAll()
    }
  }

  getItemsQuantity () {
    if (this.user) {
      return this.user.getCartQty
    } else {
      return this.sessionCart.getCartQty()
    }
  }

  modifyItems (productId, quantity) {
    if (this.user) {
      this.user.addToCart(productId, quantity)
    } else {
      this.sessionCart.addToCart(productId, quantity)
    }
  }

  save () {
    if (this.user) {
      return this.user.save()
    } else {
      return this.sessionCart.save()
    }
  }
}

module.exports = Cart
