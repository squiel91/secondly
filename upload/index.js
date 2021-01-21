const multer = require("multer")

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "public/gallery")
    },
    filename: (req, file, cb) => {
      cb(null, Date.now()+ file.originalname)
    }
  })
  
  const fileFilter = (req, file, cb) => {
    if (
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/jpeg"
    ) {
      cb(null, true)
    } else {
      cb(null, false)
    }
  }
  
  const upload = multer({ storage: fileStorage, fileFilter }).single('gallery')

  module.exports = upload