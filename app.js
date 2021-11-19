// Third party imports.
const compression = require('compression');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const xss = require('xss-clean');

// Routing
const adminRouter = require('./routes/adminRoutes');
const userRouter = require('./routes/userRoutes');
const employeeRouter = require('./routes/employeeRoutes');
const clientRouter = require('./routes/clientRoutes');
const cityRouter = require('./routes/cityRoutes');
const serviceRouter = require('./routes/serviceRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const contactRouter = require('./routes/contactRoutes');
const notificationRouter = require('./routes/notificationRoutes');
const reportRouter = require('./routes/reportRoutes');
const appointmentRouter = require('./routes/appointmentRoutes');
const contractRouter = require('./routes/contractRoutes');
const settingRouter = require('./routes/settingRoutes');
const pageRouter = require('./routes/pageRoutes');
const analyticRouter = require('./routes/analyticRoutes');

// Utilities
const AppError = require('./utils/appError');

// Middlewares
const errorMiddleware = require('./middlewares/errorMiddleware');
const { ROUTE_NOT_FOUND } = require('./translations/errors');
const getTranslated = require('./translations/helper');
const { getHeaderLang } = require('./utils/factory');

// Application Setup.
const app = express();

// Global Middlewares.
// Enable CORS (Access-Control-Allow-Origin: only from the client!)
app.use(cors());

// Before the real request is done, first respond to the OPTIONS request (it's a HTTP method).
// Send back the Access-Control-Allow-Origin to confirm that the request is safe to send.
// Apply this request on everything.
app.options('*', cors());

// Trust Proxies
//app.enable('trust proxy');

// Security Headers
//app.use(helmet());

// Body Parser
//app.use(express.json({ limit: '10kb' }));
app.use(
  express.urlencoded({
    extended: true,
    limit: '10kb',
  })
);
app.use(express.json()); // To parse the incoming requests with JSON payloads
app.use(cookieParser());

// Sanitize inputs (NoSQL query attacks)
app.use(mongoSanitize());

// Sanitize inputs (XSS)
app.use(xss());

// Preventing parameter tampering
app.use(hpp());

// Rate Limiter
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 100,
  message: 'Too many requests! Please try again in an hour!',
});

// Development Logs
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Compress the responses
app.use(compression());

// Routing
app.use('/api', limiter);

// Setup Routes
app.use('/api/admins', adminRouter);
app.use('/api/users', userRouter);
app.use('/api/employees', employeeRouter);
app.use('/api/clients', clientRouter);
app.use('/api/cities', cityRouter);
app.use('/api/services', serviceRouter);
app.use('/api/reviews', reviewRouter);
app.use('/api/contacts', contactRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api/reports', reportRouter);
app.use('/api/appointments', appointmentRouter);
app.use('/api/contracts', contractRouter);
app.use('/api/settings', settingRouter);
app.use('/api/pages', pageRouter);
app.use('/api/analytics', analyticRouter);

// Defining undefined routes.
// If we are able to reach this point - then no route match.
// If we are able to reach other routes - then the request - response cycle would have been finished in the routes.
// If next() is passed anything - Express will assume that it is an error.
app.all('*', (req, res, next) => {
  next(
    new AppError(
      getTranslated(
        ROUTE_NOT_FOUND,
        getHeaderLang(req.headers),
        req.originalUrl
      ),
      404
    )
  );
});

// Middleware for error handling.
app.use(errorMiddleware);

module.exports = app;
