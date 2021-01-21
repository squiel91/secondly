const Image = require('../models/Image')

// get image gallery
exports.getGallery = async (req, res, next) => {
    Image.find().then((datas)=>{
        res.render("gallery/gallery.ejs",{datas})
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
        
        image.save()
        return res.redirect("gallery")
}

// PATCH gallery API
exports.patchGallery = async (req, res, next) => {

    let imageName = req.body.name
    let imageAlt = req.body.alt
    let id = req.params.id

    Image.findByIdAndUpdate(id,{$set:{name: imageName, alt: imageAlt}},{new:true, upsert:true}).then((data)=>{
        res.send(data)
    })
}

// DELETE gallery API
exports.deleteGallery = async (req, res, next) => {
    let id = req.params.id
    Image.findByIdAndDelete(id).then((data)=>{
        res.send(data)
    })
}
