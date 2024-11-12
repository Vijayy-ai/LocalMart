const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const cors = require('cors');

module.exports = function(app) {
    // Security headers
    app.use(helmet());

    // Rate limiting
    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100 // limit each IP to 100 requests per windowMs
    });
    app.use('/api', limiter);

    // Data sanitization against NoSQL query injection
    app.use(mongoSanitize());

    // Data sanitization against XSS
    app.use(xss());

    // CORS configuration
    app.use(cors({
        origin: process.env.NODE_ENV === 'production' 
            ? 'https://localmart.brainitix.com'
            : 'http://localhost:8080',
        credentials: true
    }));
}; 