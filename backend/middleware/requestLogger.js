// Request logging middleware
const requestLogger = (req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    const timestamp = new Date().toISOString();
    const method = req.method;
    const url = req.originalUrl;
  }
  
  next();
};

module.exports = requestLogger;