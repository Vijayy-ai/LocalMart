const express = require('express');
const router = express.Router();

// API endpoints for mobile app
router.get('/nearby', async (req, res) => {
    const { latitude, longitude, radius } = req.query;
    // Find items within radius using geospatial queries
});

router.post('/push-notification', async (req, res) => {
    // Send push notifications for new items/messages
});

router.get('/search-suggestions', async (req, res) => {
    try {
        const { term } = req.query;
        const suggestions = await Listing.find({
            $or: [
                { title: { $regex: term, $options: 'i' } },
                { description: { $regex: term, $options: 'i' } },
                { tags: { $regex: term, $options: 'i' } }
            ],
            status: 'available'
        })
        .select('title price image')
        .limit(5);
        
        res.json(suggestions);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching suggestions' });
    }
});

router.get('/nearby-listings', async (req, res) => {
    try {
        const { lat, lng, radius } = req.query;
        
        // Convert radius from meters to kilometers
        const radiusInKm = parseInt(radius) / 1000;

        const listings = await Listing.find({
            status: 'available',
            geometry: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(lng), parseFloat(lat)]
                    },
                    $maxDistance: radiusInKm * 1000 // Convert back to meters for MongoDB
                }
            }
        }).limit(50); // Limit results

        res.json(listings);
    } catch (err) {
        console.error('Error finding nearby listings:', err);
        res.status(500).json({ error: 'Error finding nearby listings' });
    }
});

module.exports = router; 