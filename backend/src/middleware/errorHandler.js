// src/middleware/errorHandler.js
function errorHandler(err, req, res, next) {
  console.error(err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    details: err.details || undefined
  });
}

module.exports = errorHandler; 