const mongoose = require('mongoose');
const Listing = require('../models/listing');

async function testGeospatialQueries() {
    try {
        // Test location (Jaipur)
        const testLocation = {
            type: 'Point',
            coordinates: [75.7873, 26.9124]
        };

        // Create a test listing
        const testListing = new Listing({
            title: 'Test Item',
            description: 'Test Description',
            price: 1000,
            location: 'Jaipur, Rajasthan',
            geometry: testLocation,
            meetingPoint: {
                coordinates: testLocation.coordinates,
                description: 'Test Location'
            },
            sellerName: 'Test Seller',
            condition: 'New',
            category: 'Electronics',
            expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });

        await testListing.save();
        console.log('Test listing created');

        // Test nearby query
        const nearbyListings = await Listing.find({
            geometry: {
                $near: {
                    $geometry: testLocation,
                    $maxDistance: 5000 // 5km
                }
            }
        });

        console.log(`Found ${nearbyListings.length} nearby listings`);

        // Cleanup
        await testListing.deleteOne();
        console.log('Test listing cleaned up');

    } catch (err) {
        console.error('Test failed:', err);
    }
}

// Run tests
if (require.main === module) {
    mongoose.connect(process.env.MONGODB_URL || 'mongodb://127.0.0.1:27017/localmart')
        .then(() => {
            console.log('Connected to MongoDB');
            return testGeospatialQueries();
        })
        .then(() => {
            console.log('Tests complete');
            process.exit(0);
        })
        .catch(err => {
            console.error('Tests failed:', err);
            process.exit(1);
        });
} 