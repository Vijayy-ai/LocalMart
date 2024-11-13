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
        default: "https://res.cloudinary.com/dbxbzgwk7/image/upload/v1/LocalMart/default",
        set: (v) => v === "" ? "https://res.cloudinary.com/dbxbzgwk7/image/upload/v1/LocalMart/default" : v,
    },
    price: {
        type: Number,
        min: 0,
        required: true,
    },
    location: {
        type: String,
        default: 'Location not specified',
        trim: true,
    },
    status: {
        type: String,
        enum: ['available', 'reserved', 'sold'],
        default: 'available'
    },
    expiryDate: {
        type: Date,
        default: () => new Date(+new Date() + 7*24*60*60*1000) // 7 days from now
    },
    range: {
        type: Number,
        default: 500,
        min: 100,
        max: 1000
    },
    sellerName: {
        type: String,
        default: 'Anonymous',
        trim: true,
    },
    sellerContact: {
        type: String,
        trim: true,
    },
    images: [{
        url: String,
        filename: String
    }],
    condition: {
        type: String,
        enum: ['New', 'Like New', 'Good', 'Fair', 'Poor', ''],
        default: ''
    },
    category: {
        type: String,
        enum: ['Electronics', 'Furniture', 'Clothing', 'Books', 'Home', 'Other', ''],
        default: ''
    },
    tags: [String],
    views: {
        type: Number,
        default: 0
    },
    favorites: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    bundle: {
        isBundle: {
            type: Boolean,
            default: false
        },
        items: [String],
        bundleDiscount: Number
    },
    negotiable: {
        type: Boolean,
        default: true
    },
    minAcceptablePrice: Number
}, {
    timestamps: true
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
