function errorHandler(err, req, res, next) {
  console.error('API Error:', err);

  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'An unexpected internal server error occurred',
    details: err.details || undefined
  });
}

module.exports = { errorHandler };
