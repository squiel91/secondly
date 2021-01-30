exports._200 = (res, payload) => {
  return res.json({
    success: true,
    ...payload
  })
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
