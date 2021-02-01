const mongoose = require('mongoose')

const Schema = mongoose.Schema

const userSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  handle: {
    type: String,
    required: true
  },
  description: String,
  products: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    }
  ],
  // It will be listed in the menu
  listed: {
    type: Boolean,
    default: true
  },
  // It will be listed in the homepeage as a button, right below the subtitle
  featured: {
    type: Boolean,
    default: false
  }
})

module.exports = mongoose.model('Category', userSchema)
