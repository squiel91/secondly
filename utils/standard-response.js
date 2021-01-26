// deprecated
exports.errorResponse = (name,message) => {

    let FIELD_ERRORS_LIST = {
        "name":name,
        "message":message
    }
    let errorResponse = {
        "error": true,
        "fields": FIELD_ERRORS_LIST
    }
    return errorResponse
}

// deprecated
exports.successResponse = (user) => {
  let successResponse = {
      "success": true,
      "User": user
  }
  return successResponse
}

exports._400 = (res, name,message) => {
  return res.status(400).json({
    error: true,
    fields: [
      { name, message }
    ]
  })
}

exports._500 = (res, message) => {
  return res.status(400).json({
    error: true,
    message: `Internal server error: ${message}`
  })
}
