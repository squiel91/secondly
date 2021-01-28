module.exports = category => {
    return {
            id: category._id,
            title: category.title,
            handle: category.handle,
            description: category.description?category.description:undefined,
        }
}