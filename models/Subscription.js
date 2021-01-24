const mongoose = require('mongoose')

const Schema = mongoose.Schema

const subscriptionSchema = new Schema({
  email:  {
    type: String,
    require: true,
    unique: true
  }
}, { timestamps: true })

module.exports = mongoose.model('Subscription', subscriptionSchema)