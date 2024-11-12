const analyticsSchema = new Schema({
    marketMetrics: {
        totalTransactions: Number,
        averagePrice: Number,
        popularCategories: [String],
        peakTimes: [Date]
    },
    userBehavior: {
        searchPatterns: Map,
        browsingDuration: Number,
        conversionRate: Number
    }
}); 