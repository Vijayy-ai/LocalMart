const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    profileImage: {
        type: String,
        default: 'default-profile.png'
    },
    ratings: [{
        rating: Number,
        review: String,
        reviewer: { type: Schema.Types.ObjectId, ref: 'User' },
        createdAt: { type: Date, default: Date.now }
    }],
    reliability: {
        score: { type: Number, default: 100 },
        successfulDeals: { type: Number, default: 0 },
        failedDeals: { type: Number, default: 0 }
    },
    listings: [{
        type: Schema.Types.ObjectId,
        ref: 'Listing'
    }],
    favorites: [{
        type: Schema.Types.ObjectId,
        ref: 'Listing'
    }],
    notifications: [{
        type: { type: String },
        message: String,
        read: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now }
    }]
}, {
    timestamps: true
});

// Password hashing middleware
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema); 