class ApiError extends Error {
  constructor(status, errors) {
    const list = Array.isArray(errors) ? errors : [errors];
    // crea un messaggio sintetico per Err.message
    const msg = list
      .map(e => (typeof e === 'string' ? e : e?.message || e?.msg || String(e)))
      .join('; ');

    super(msg);
    this.name = 'ApiError';
    this.status = status;
    this.errors = list;
    Error.captureStackTrace?.(this, this.constructor);
  }

  toJSON() {
    return { error: this.message, errors: this.errors };
  }
}

module.exports = ApiError;
