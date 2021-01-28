module.exports = product => {
    return {
            id: product._id,
            title: product.title,
            price: product.price,
            compareAt: product.compareAt,
            stock: product.stock? product.stock: undefined,
            shippingCost: product.shippingCost,
            publish: product.publish,
            images: product.imagePaths
        }
}