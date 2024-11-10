const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    const statusCode = err.statusCode || 500;
    res.status(statusCode).render('error', { 
        err: {
            message: err.message || 'Something went wrong!',
            stack: process.env.NODE_ENV === 'development' ? err.stack : ''
        }
    });
};

module.exports = errorHandler; 