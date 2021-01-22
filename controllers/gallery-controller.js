const Image = require('../models/Image')

// get image gallery
exports.getGallery = async (req, res, next) => {
    Image.find().then((images)=>{
        res.render("gallery/gallery.ejs",{images})
    })
}

// post image into gallery
exports.postGallery = async (req, res, next) => {
    
    var filePath = req.file.path.replace("public","")
    filePath = filePath.replace(/\\/g, "/")
        let image = new Image({
            name: req.file.originalname.trim(),
            src: filePath.trim(),
            alt: req.file.fieldname
        })
        
        const newImage = await image.save()
        res.json({success: true, image: newImage})
}

// PATCH gallery API
exports.patchGallery = async (req, res, next) => {

    let imageName = req.body.name
    let imageAlt = req.body.alt
    let id = req.params.imageId

    await Image.findByIdAndUpdate(id,{$set:{name: imageName, alt: imageAlt}},{new:true, upsert:true}).then((data)=>{
        res.json({success: true})
    })
}

// DELETE gallery API
exports.deleteGallery = async (req, res, next) => {
    let id = req.params.imageId
    await Image.findByIdAndDelete(id).then((data)=>{
        res.json({success: true})
    })
}
