const User = require('../models/user');
const Listing = require('../models/listing');
const Transaction = require('../models/transaction');
const Analytics = require('../utils/analytics');

class DashboardController {
    static async getDashboard(req, res) {
        try {
            const userId = req.user._id;
            
            // Fetch user data with related information
            const user = await User.findById(userId)
                .populate('listings')
                .populate('favorites')
                .populate({
                    path: 'ratings',
                    populate: { path: 'reviewer' }
                });

            // Get analytics data
            const analytics = await Analytics.getUserAnalytics(userId);

            // Get recent transactions
            const transactions = await Transaction.find({
                $or: [{ seller: userId }, { buyer: userId }]
            })
            .sort('-createdAt')
            .limit(5)
            .populate('listing');

            // Get active listings
            const activeListings = await Listing.find({
                seller: userId,
                status: 'available'
            }).sort('-createdAt');

            // Get listing performance metrics
            const metrics = await Analytics.getListingMetrics(userId);

            res.render('dashboard/index', {
                user,
                analytics,
                transactions,
                activeListings,
                metrics,
                pageTitle: 'Dashboard'
            });
        } catch (err) {
            console.error('Dashboard Error:', err);
            req.flash('error', 'Error loading dashboard');
            res.redirect('/');
        }
    }

    static async getListingAnalytics(req, res) {
        try {
            const { listingId } = req.params;
            const analytics = await Analytics.getListingAnalytics(listingId);
            res.json(analytics);
        } catch (err) {
            res.status(500).json({ error: 'Error fetching analytics' });
        }
    }

    static async getTransactionHistory(req, res) {
        try {
            const userId = req.user._id;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;

            const transactions = await Transaction.find({
                $or: [{ seller: userId }, { buyer: userId }]
            })
            .sort('-createdAt')
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('listing')
            .populate('buyer', 'username')
            .populate('seller', 'username');

            const total = await Transaction.countDocuments({
                $or: [{ seller: userId }, { buyer: userId }]
            });

            res.render('dashboard/transactions', {
                transactions,
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                pageTitle: 'Transaction History'
            });
        } catch (err) {
            req.flash('error', 'Error loading transaction history');
            res.redirect('/dashboard');
        }
    }

    static async getListingManagement(req, res) {
        try {
            const userId = req.user._id;
            const status = req.query.status || 'all';
            const search = req.query.search || '';

            let query = { seller: userId };
            if (status !== 'all') {
                query.status = status;
            }
            if (search) {
                query.title = { $regex: search, $options: 'i' };
            }

            const listings = await Listing.find(query)
                .sort('-createdAt')
                .populate('favorites');

            res.render('dashboard/listings', {
                listings,
                status,
                search,
                pageTitle: 'Manage Listings'
            });
        } catch (err) {
            req.flash('error', 'Error loading listings');
            res.redirect('/dashboard');
        }
    }

    static async getProfileSettings(req, res) {
        try {
            const user = await User.findById(req.user._id);
            res.render('dashboard/settings', {
                user,
                pageTitle: 'Profile Settings'
            });
        } catch (err) {
            req.flash('error', 'Error loading settings');
            res.redirect('/dashboard');
        }
    }

    static async updateProfileSettings(req, res) {
        try {
            const updates = {
                username: req.body.username,
                email: req.body.email,
                notifications: {
                    email: req.body.emailNotifications === 'on',
                    push: req.body.pushNotifications === 'on'
                }
            };

            if (req.file) {
                updates.profileImage = req.file.path;
            }

            const user = await User.findByIdAndUpdate(
                req.user._id,
                updates,
                { new: true, runValidators: true }
            );

            req.flash('success', 'Profile updated successfully');
            res.redirect('/dashboard/settings');
        } catch (err) {
            req.flash('error', 'Error updating profile');
            res.redirect('/dashboard/settings');
        }
    }
}

module.exports = DashboardController; 