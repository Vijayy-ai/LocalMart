const express = require('express');
const router = express.Router();
const Rating = require('../models/rating');
const Listing = require('../models/listing');
const User = require('../models/user');

// Submit a new rating
router.post('/listings/:id/rate', async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, review } = req.body;
        const listing = await Listing.findById(id);
        
        const newRating = new Rating({
            rating: rating,
            review: review,
            reviewer: req.user._id, // Assuming you have user authentication
            listing: id,
            seller: listing.seller
        });

        await newRating.save();

        // Update seller's average rating
        const sellerRatings = await Rating.find({ seller: listing.seller });
        const averageRating = sellerRatings.reduce((acc, curr) => acc + curr.rating, 0) / sellerRatings.length;
        
        await User.findByIdAndUpdate(listing.seller, {
            averageRating: averageRating,
            totalRatings: sellerRatings.length
        });

        res.redirect(`/listings/${id}`);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error submitting rating');
    }
});

module.exports = router; 