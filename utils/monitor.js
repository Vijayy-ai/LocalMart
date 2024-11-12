const checkHealth = async () => {
    try {
        // Check MongoDB
        const dbState = mongoose.connection.readyState;
        
        // Check Cloudinary
        const cloudinaryTest = await cloudinary.v2.api.ping();
        
        return {
            status: 'healthy',
            database: dbState === 1 ? 'connected' : 'disconnected',
            cloudinary: cloudinaryTest.status === 'ok'
        };
    } catch (error) {
        return {
            status: 'unhealthy',
            error: error.message
        };
    }
}; 