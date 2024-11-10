const mongoose = require('mongoose');
const Listing = require('../models/listing');

async function setupIndexes() {
    try {
        // Create 2dsphere index for geometry
        await Listing.collection.createIndex({ "geometry": "2dsphere" });
        
        // Create 2dsphere index for meetingPoint
        await Listing.collection.createIndex({ "meetingPoint.coordinates": "2dsphere" });
        
        // Create text indexes for search
        await Listing.collection.createIndex({
            title: "text",
            description: "text",
            tags: "text"
        });

        console.log('Database indexes created successfully');
    } catch (err) {
        console.error('Error creating indexes:', err);
    }
}

// Run this script to set up indexes
if (require.main === module) {
    mongoose.connect(process.env.MONGODB_URL || 'mongodb://127.0.0.1:27017/localmart')
        .then(() => {
            console.log('Connected to MongoDB');
            return setupIndexes();
        })
        .then(() => {
            console.log('Setup complete');
            process.exit(0);
        })
        .catch(err => {
            console.error('Setup failed:', err);
            process.exit(1);
        });
}

module.exports = setupIndexes; 