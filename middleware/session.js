const session = require('express-session');
const MongoStore = require('connect-mongo');

module.exports = function(app) {
    app.use(session({
        secret: process.env.SESSION_SECRET || 'your-secret-key',
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
            mongoUrl: process.env.MONGODB_URL,
            ttl: 24 * 60 * 60 // 1 day
        }),
        cookie: {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        }
    }));
}; 