const mongoose = require('mongoose')

const Schema = mongoose.Schema

const orderSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: [
      'new', // The order has been received but not yet acknoledged
      'unpaid', // The order has been created but not yet paid
      'processing', // The seller has acknolage it and is processing the order
      'shipped',
      'refunded',
      'completed' // The order is completed
    ],
    default: 'new'
  },
  personal: {
    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    }
  },
  shipping: {
    state: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    // address: {
    //   type: String,
    //   required: true
    // },
    zip: {
      type: String,
      required: true
    },
    tracking: String,
  },
  items: [
    {
      originalProduct: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      title: {
        type: String,
        required: true
      },
      unitPrice: {
        type: Number,
        required: true
      },
      unitShippingCost: {
        type: Number,
        required: true
      },
      quantity: {
        type: Number,
        required: true
      }
    }
  ]
}, { timestamps: { createdAt: 'created' } })

orderSchema.methods.totalPrice = function () {
  return this.items.reduce((accum, item) => accum + (item.unitPrice + item.unitShippingCost) * item.quantity, 0)
}

module.exports = mongoose.model('Order', orderSchema)
