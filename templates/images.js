const imageTemplate = image => {
  return {
    id: image.id,
    name: image.id,
    src: image.src,
    alt: image.alt
  }
}

// accepts a unique object or an array
module.exports = (imageOrImages) => {
  if (!imageOrImages) return
  if (Array.isArray(imageOrImages)) {
    const images = imageOrImages
    return images.map(image => imageTemplate(image))
  }
  const image = imageOrImages;
  return imageTemplate(image)

}