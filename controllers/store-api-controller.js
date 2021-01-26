const Cart = require('../models/cart')
const Product = require('../models/Product')
const stdRes = require('../utils/standard-response')
const cartTemplate = require('../models/templates/cart')

 
exports.postCart = async (req, res, next) => {
    try{
        let productId = req.body.productId
        let quantity = req.body.quantity
        
        const productFound = await Product.findOne({_id:productId,publish:'true'})
        if(!productFound) return stdRes._400(res, 'productId', 'Either Product Id is not valid or product is not published.')

        const matchProduct = await Cart.findOne({productId:productFound._id})
        if(matchProduct) newQuantity = parseInt(quantity) + parseInt(matchProduct.quantity)

        await Cart.updateOne({_id:matchProduct._id},{quantity:newQuantity})
        const product = await Product.findById(productId).select('title price stock shippingCost imagePaths')
        
        let response = {
            product,
            newQuantity
        }
        res.json({ 
            success: true,
            cart: cartTemplate(response)
          })
    }catch(error){
        stdRes._500(res, error.message)
    }
}

exports.postCheckout = async (req, res, next) => {
    try{
        req.session.shipping = {
            firstName: req.body.firstName,
            lastname: req.body.lastname,
            email: req.body.email,
            address: req.body.address,
            state: req.body.state,
            city: req.body.city,
            zip: req.body.zip
        }
        res.json({ success: true })
    }catch(error){
        stdRes._500(res, error.message)
    }
}