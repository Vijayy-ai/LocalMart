const express = require('express');
const router = express.Router();
const DashboardController = require('../controllers/dashboardController');
const { isAuthenticated } = require('../middleware/auth');
const upload = require('../middleware/multer');

// Main dashboard
router.get('/', isAuthenticated, DashboardController.getDashboard);

// Analytics
router.get('/analytics/:listingId', isAuthenticated, DashboardController.getListingAnalytics);

// Transactions
router.get('/transactions', isAuthenticated, DashboardController.getTransactionHistory);

// Listing management
router.get('/listings', isAuthenticated, DashboardController.getListingManagement);

// Profile settings
router.get('/settings', isAuthenticated, DashboardController.getProfileSettings);
router.post('/settings', 
    isAuthenticated, 
    upload.single('profileImage'),
    DashboardController.updateProfileSettings
);

module.exports = router; 