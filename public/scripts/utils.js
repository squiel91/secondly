/* eslint-disable no-undef */
// {
//   method: POST [ default ] 
//   params: object
//   success: function (error)
//   error: function (object)
//   internalError: function (object)
// }

// eslint-disable-next-line no-unused-vars
function fetchApi (url, options) {
  $('.errorMessage').empty()

  const method = options.method || 'POST'
  const params = options.params
  const successCallback = options.success
  const errorCallback = options.error || function (data) {
    if (data.message) $('.errorMessage').text(data.message)
    if (data.fields) {
      for (const fieldError of data.fields) {
        const validatableInput = $(`.validatable-input.${fieldError.name}`)
        validatableInput.addClass('error')
        validatableInput.find('.secondlyErrorMessage').text(fieldError.message)
      }
    }
  }
  const internalErrorCallback = options.internalError || function (error) {
    $('.errorMessage').text(`There was an error: ${error.message}.`)
    console.error(error)
  }

  fetch(url, {
    method: method,
    credentials: 'same-origin',
    xhrFields: { withCredentials: true },
    headers: { 'Content-Type': 'application/json' },
    body: params ? JSON.stringify(params) : undefined
  })
    .then(response => {
      return response.json()
    })
    .then(data => {
      if (data.success) {
        if (successCallback) successCallback(data)
      } else {
        if (errorCallback) errorCallback(data)
      }
    })
    .catch(function(error) {
      if (error) internalErrorCallback(error)
    })
}
