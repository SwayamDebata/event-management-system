const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const connectDB = require('./config/database');

const errorHandler = require('./middleware/errorHandler');
const requestLogger = require('./middleware/requestLogger');

const profileRoutes = require('./routes/profileRoutes');
const eventRoutes = require('./routes/eventRoutes');
const indexRoutes = require('./routes/index');

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL || 'http://localhost:3000'
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(requestLogger);

app.use('/api', indexRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/events', eventRoutes);

app.all('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

app.use(errorHandler);

const findAvailablePort = (startPort) => {
  return new Promise((resolve, reject) => {
    const server = require('net').createServer();
    
    server.listen(startPort, () => {
      const port = server.address().port;
      server.close(() => resolve(port));
    });
    
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        findAvailablePort(startPort + 1).then(resolve).catch(reject);
      } else {
        reject(err);
      }
    });
  });
};

const startServer = async () => {
  try {
    const availablePort = await findAvailablePort(PORT);
    
    const server = app.listen(availablePort, () => {
      console.log(`Event Management Server is running on port ${availablePort}`);
    });

    return server;
  } catch (error) {
    process.exit(1);
  }
};

startServer();

module.exports = app;