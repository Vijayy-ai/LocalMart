const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    image: {
        type: String,
        default: "https://images.unsplash.com/photo-1553531384-cc64ac80f931",
        set: (v) => v === "" ? "https://images.unsplash.com/photo-1553531384-cc64ac80f931" : v,
    },
    price: {
        type: Number,
        min: 0,
        required: true,
    },
    location: {
        type: String,
        required: true,
        trim: true,
    },
    status: {
        type: String,
        enum: ['available', 'reserved', 'sold'],
        default: 'available'
    },
    expiryDate: {
        type: Date,
        required: true
    },
    range: {
        type: Number,
        default: 500,
        min: 100,
        max: 1000
    },
    sellerName: {
        type: String,
        required: true,
        trim: true,
    },
    sellerContact: {
        type: String,
        trim: true,
    }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
