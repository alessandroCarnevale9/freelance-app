class ApiError extends Error {

  constructor(status, errors) {
    super()
    this.status = status
    this.errors = Array.isArray(errors) ? errors : [errors]
  }
}

module.exports = ApiError
