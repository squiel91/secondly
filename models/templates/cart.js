module.exports = cart => {
    return [{
        product: {
            id: cart.product._id,
            title: cart.product.title,
            price: cart.product.price,
            stock: cart.product.stock? cart.product.stock: undefined,
            shippingCost: cart.product.shippingCost,
            imagePaths: cart.product.imagePaths,
        },
        quantity: cart.newQuantity
    }]
}