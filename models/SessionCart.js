const fs = require('fs')
const Products = require('./Product')
const rootPath = require('../utils/root-path')

module.exports = class SessionCart {
  
  static load(session) {
    return new SessionCart(session? session.items : [], session)
  }

  constructor(items, session) {
    this.items = items? items : []
    this.session = session
  }

  save(callback) {
    this.session.items = this.items
    this.session.save(() => callback())
  }

  getAll(callback) {
    const productPromises = [] 
    const quantities = [] 
    this.items.forEach(item => {
      productPromises.push(Products.findById(item.product))
      quantities.push(item.quantity)
    })

    if (callback) {
      Promise.all(productPromises)
        .then(productResolved => {
          let cartItems = []
          for (let productIndex in productResolved) {
            cartItems.push({product: productResolved[productIndex], quantity: quantities[productIndex]})
          }
          callback(cartItems)
        })
    } else {
      return new Promise((resolve, reject) => {
        Promise.all(productPromises)
        .then(productResolved => {
          let cartItems = []
          for (let productIndex in productResolved) {
            cartItems.push({product: productResolved[productIndex], quantity: quantities[productIndex]})
          }
          resolve(cartItems)
        })
      })
    }
    
    return
  }

  getCartQty() {
    if (!this.items) return 0
    return this.items.reduce((accum, item) => accum + item.quantity, 0)
  }

  addToCart(productId, quantity) {
    if (!quantity) quantity = 1
   
    const cartProductIndex = this.items.findIndex((elem) => elem.product.toString() === productId.toString())
    if (cartProductIndex >= 0) {
      let item = this.items[cartProductIndex]
      item.quantity += quantity
  
      if (item.quantity <= 0) {
        this.items.splice(cartProductIndex, 1)
      }
    } else {
      if (quantity > 0) {
        this.items.push({
          product: productId,
          quantity: quantity
        })
      }
    }
  }

  reset(callback) {
    this.items = []
    if (!this.session.remember) this.session.shippment = undefined
    if (callback) return this.save(callback)
    else new Promise((resolve, reject) => {
      try {
        this.save(result => {
          resolve(result)
        })
      } catch (error) {
        reject(error)
      }
    })
  }
}