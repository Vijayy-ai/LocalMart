const express = require('express');
const router = express.Router();
const Listing = require('../models/listing');
const { maxRadius } = require('../config/maps');

router.get('/listings/nearby', async (req, res) => {
    try {
        const { lat, lng, radius = 2000 } = req.query;
        const maxAllowedRadius = Math.min(parseInt(radius), maxRadius);

        const listings = await Listing.find({
            status: 'available',
            geometry: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(lng), parseFloat(lat)]
                    },
                    $maxDistance: maxAllowedRadius
                }
            }
        }).limit(50);

        res.json({
            success: true,
            data: listings,
            meta: {
                count: listings.length,
                radius: maxAllowedRadius
            }
        });
    } catch (err) {
        console.error('Error finding nearby listings:', err);
        res.status(500).json({
            success: false,
            error: 'Error finding nearby listings'
        });
    }
});

module.exports = router; 