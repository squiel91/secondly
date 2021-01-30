module.exports = page => {
  return {
          id: page._id,
          title: page.title,
          handle: page.handle,
          content: page.content? page.content : undefined
      }
} 