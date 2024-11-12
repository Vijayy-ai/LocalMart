const Listing = require('../models/listing');
const Transaction = require('../models/transaction');
const moment = require('moment');

class Analytics {
    static async getUserAnalytics(userId) {
        try {
            const endDate = new Date();
            const startDate = moment().subtract(30, 'days').toDate();
            
            // Get daily views and sales data
            const dailyData = await this.getDailyMetrics(userId, startDate, endDate);
            
            // Get category performance
            const categoryData = await this.getCategoryMetrics(userId);
            
            // Get conversion rates
            const conversionData = await this.getConversionMetrics(userId);
            
            return {
                dates: dailyData.dates,
                views: dailyData.views,
                sales: dailyData.sales,
                categories: categoryData,
                conversion: conversionData
            };
        } catch (err) {
            console.error('Error getting user analytics:', err);
            throw err;
        }
    }

    static async getDailyMetrics(userId, startDate, endDate) {
        const listings = await Listing.find({ seller: userId });
        const listingIds = listings.map(l => l._id);

        // Get views data
        const viewsData = await Listing.aggregate([
            {
                $match: {
                    _id: { $in: listingIds },
                    createdAt: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    views: { $sum: "$views" }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Get sales data
        const salesData = await Transaction.aggregate([
            {
                $match: {
                    seller: userId,
                    status: 'completed',
                    createdAt: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    sales: { $sum: 1 },
                    revenue: { $sum: "$amount" }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Format data for chart
        const dates = [];
        const views = [];
        const sales = [];
        
        let currentDate = moment(startDate);
        const end = moment(endDate);

        while (currentDate <= end) {
            const dateStr = currentDate.format('YYYY-MM-DD');
            dates.push(dateStr);
            
            const viewData = viewsData.find(d => d._id === dateStr);
            views.push(viewData ? viewData.views : 0);
            
            const saleData = salesData.find(d => d._id === dateStr);
            sales.push(saleData ? saleData.sales : 0);
            
            currentDate.add(1, 'days');
        }

        return { dates, views, sales };
    }

    static async getCategoryMetrics(userId) {
        return await Listing.aggregate([
            { $match: { seller: userId } },
            {
                $group: {
                    _id: "$category",
                    count: { $sum: 1 },
                    totalViews: { $sum: "$views" },
                    averagePrice: { $avg: "$price" }
                }
            }
        ]);
    }

    static async getConversionMetrics(userId) {
        const listings = await Listing.find({ seller: userId });
        const totalViews = listings.reduce((sum, listing) => sum + listing.views, 0);
        const totalSales = await Transaction.countDocuments({
            seller: userId,
            status: 'completed'
        });

        return {
            rate: totalViews ? (totalSales / totalViews) * 100 : 0,
            totalViews,
            totalSales
        };
    }

    static async getListingMetrics(userId) {
        const [totalEarnings, activeListings, totalViews] = await Promise.all([
            Transaction.aggregate([
                {
                    $match: {
                        seller: userId,
                        status: 'completed'
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: "$amount" }
                    }
                }
            ]),
            Listing.countDocuments({ seller: userId, status: 'available' }),
            Listing.aggregate([
                {
                    $match: { seller: userId }
                },
                {
                    $group: {
                        _id: null,
                        totalViews: { $sum: "$views" }
                    }
                }
            ])
        ]);

        return {
            totalEarnings: totalEarnings[0]?.total || 0,
            activeListings,
            totalViews: totalViews[0]?.totalViews || 0
        };
    }

    static async getListingAnalytics(listingId) {
        const listing = await Listing.findById(listingId);
        if (!listing) throw new Error('Listing not found');

        const viewsOverTime = await this.getListingViewsOverTime(listingId);
        const similarListings = await this.getSimilarListingsPerformance(listing);
        const interactionMetrics = await this.getListingInteractionMetrics(listingId);

        return {
            viewsOverTime,
            similarListings,
            interactionMetrics
        };
    }

    static async getListingViewsOverTime(listingId) {
        // Implementation for tracking views over time
        // This would require a separate collection for view events
        return [];
    }

    static async getSimilarListingsPerformance(listing) {
        return await Listing.find({
            category: listing.category,
            _id: { $ne: listing._id },
            price: {
                $gte: listing.price * 0.8,
                $lte: listing.price * 1.2
            }
        }).limit(5).select('title price views');
    }

    static async getListingInteractionMetrics(listingId) {
        // Implementation for getting detailed interaction metrics
        // This would include clicks, messages, favorites, etc.
        return {};
    }
}

module.exports = Analytics; 