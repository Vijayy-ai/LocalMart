const Listing = require('../models/listing');

async function calculateSuggestedPrice(listing) {
    try {
        // Find similar listings in the same category and location
        const similarListings = await Listing.find({
            category: listing.category,
            location: { $regex: listing.location.split(',')[0], $options: 'i' },
            status: 'sold',
            _id: { $ne: listing._id }
        }).sort({ createdAt: -1 }).limit(10);

        if (similarListings.length === 0) {
            return listing.price; // Return original price if no similar listings
        }

        // Calculate average price
        const averagePrice = similarListings.reduce((acc, curr) => acc + curr.price, 0) / similarListings.length;

        // Adjust based on condition
        const conditionMultiplier = {
            'New': 1.2,
            'Like New': 1.1,
            'Good': 1.0,
            'Fair': 0.9,
            'Poor': 0.8
        };

        const adjustedPrice = averagePrice * (conditionMultiplier[listing.condition] || 1);

        // Consider demand (based on views and favorites)
        const demandMultiplier = 1 + (listing.views * 0.01 + listing.favorites.length * 0.05);

        return Math.round(adjustedPrice * demandMultiplier);
    } catch (err) {
        console.error('Error calculating suggested price:', err);
        return listing.price;
    }
}

module.exports = { calculateSuggestedPrice }; 