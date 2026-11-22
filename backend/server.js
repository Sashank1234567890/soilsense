const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const applyMongoSchemaValidators = require('./config/initMongoValidators');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// 1. Security & Middleware
app.use(helmet({
  contentSecurityPolicy: false // Allows dashboard SVG / charts
}));
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// 2. Rate Limiting for high-traffic sensor endpoints
const ingestionLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 300, // up to 300 readings per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many sensor readings. Rate limit reached.' }
});

// 3. Connect to MongoDB and apply schema validation
if (process.env.NODE_ENV !== 'test') {
  connectDB().then(conn => {
    applyMongoSchemaValidators(conn.connection.db);
    const autoSeedDatabase = require('./config/autoSeed');
    autoSeedDatabase();
    const { initTelemetryScheduler } = require('./services/telemetryScheduleService');
    initTelemetryScheduler();
  });
}

// 4. API Routes Mounting
app.use('/api/auth', require('./routes/auth'));
app.use('/api/crops', require('./routes/crops'));
app.use('/api', require('./routes/soils'));
app.use('/api/recommendations', require('./middleware/auth').protect, require('./routes/recommendations'));
app.use('/api/soil/improvement', require('./routes/improvements'));
app.use('/api', ingestionLimiter, require('./routes/iot'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/history', require('./routes/history'));
app.use('/api/dbms', require('./routes/dbms'));
app.use('/api/advisory', require('./routes/advisoryRoutes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date(),
    service: 'SoilSense Backend API',
    dataMode: process.env.DATA_MODE || 'simulation',
    dbState: require('mongoose').connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// 5. Global Error Handler
app.use((err, req, res, next) => {
  console.error('[SoilSense Global Error Handler]:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 6. Start Server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[SoilSense API Server] Running on http://localhost:${PORT} [DATA_MODE=${process.env.DATA_MODE || 'simulation'}]`);
  });
}

module.exports = app;
