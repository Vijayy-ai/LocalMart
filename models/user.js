const userSchema = new Schema({
    username: String,
    email: String,
    ratings: [{
        rating: Number,
        review: String,
        reviewer: { type: Schema.Types.ObjectId, ref: 'User' }
    }],
    reliability: {
        score: { type: Number, default: 100 },
        successfulDeals: { type: Number, default: 0 },
        failedDeals: { type: Number, default: 0 }
    }
}); 