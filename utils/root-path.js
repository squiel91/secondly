const path = require('path')

module.exports = (...paths) => {
  return path.join(
    path.dirname(process.mainModule.filename),
    ...paths
  )
}