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

exports.successResponse = (user) => {
    let successResponse = {
        "success": true,
        "User": user
    }
    return successResponse
}
