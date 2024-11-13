const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require('express-session');
const flash = require('connect-flash');
const http = require('http');
const socketIO = require('socket.io');
const server = http.createServer(app);
const io = socketIO(server);
const upload = require('./middleware/multer');
const { cloudinary } = require('./cloudinary');
const { Client } = require('@googlemaps/google-maps-services-js');
const googleMapsClient = new Client({});
const mapsConfig = require('./config/maps');
const apiRoutes = require('./api/routes');
const setupIndexes = require('./utils/setupDb');
const multer = require('multer');
require('dotenv').config();
const cors = require('cors');

const MONGO_URL = process.env.MONGODB_URL || 'mongodb://127.0.0.1:27017/localmart';

// Add this near the top of your app.js
process.noDeprecation = true;

app.use(cors());

main().then(async () => {
    console.log("connected to Database");
    await setupIndexes();
}).catch(err => console.log(err));

async function main() {
  await mongoose.connect(MONGO_URL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

// Add session configuration before other middleware
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}));

// Add flash after session
app.use(flash());

// Add flash middleware
app.use((req, res, next) => {
    res.locals.currentUser = req.session.user || null;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

// Middleware to check for expired listings
app.use(async (req, res, next) => {
    try {
        await Listing.updateMany(
            { expiryDate: { $lt: new Date() } },
            { status: 'expired' }
        );
        next();
    } catch (err) {
        next(err);
    }
});

//home route 
app.get("/", (req,res) => {
    res.render("listings/home.ejs");
})

// Index Route with filtering
app.get("/listings", async (req, res) => {
    try {
        let query = { status: 'available' };
        
        // Add search functionality
        if (req.query.search) {
            query.$or = [
                { title: { $regex: req.query.search, $options: 'i' } },
                { description: { $regex: req.query.search, $options: 'i' } },
                { location: { $regex: req.query.search, $options: 'i' } }
            ];
        }
        
        // Add price filter
        if (req.query.maxPrice) {
            query.price = { $lte: parseInt(req.query.maxPrice) };
        }
        
        // Add range filter
        if (req.query.range) {
            query.range = { $lte: parseInt(req.query.range) };
        }

        let sortOption = {};
        if (req.query.sort) {
            switch(req.query.sort) {
                case 'price_asc':
                    sortOption = { price: 1 };
                    break;
                case 'price_desc':
                    sortOption = { price: -1 };
                    break;
                case 'date':
                    sortOption = { createdAt: -1 };
                    break;
            }
        }

        const allListings = await Listing.find(query).sort(sortOption);
        res.render("listings/index.ejs", { allListings });
    } catch (err) {
        res.status(500).send("Error fetching listings");
    }
});

// Reserve Route
app.post("/listings/:id/reserve", async (req, res) => {
    try {
        const { id } = req.params;
        await Listing.findByIdAndUpdate(id, { status: 'reserved' });
        res.redirect(`/listings/${id}`);
    } catch (err) {
        res.status(500).send("Error reserving item");
    }
});

// Mark as Sold Route
app.post("/listings/:id/sold", async (req, res) => {
    try {
        const { id } = req.params;
        await Listing.findByIdAndUpdate(id, { status: 'sold' });
        res.redirect(`/listings/${id}`);
    } catch (err) {
        res.status(500).send("Error marking item as sold");
    }
});

// New Route
app.get("/listings/new", async (req,res) => {
    res.render("listings/new.ejs");
})

// Show Route
app.get("/listings/:id", async (req, res) => {
    try {
        let { id } = req.params;
        const listing = await Listing.findById(id);
        if (!listing) {
            req.flash('error', 'Listing not found');
            return res.redirect('/listings');
        }
        const currentUser = req.session.user || { _id: null };
        
        res.render("listings/show.ejs", { 
            listing,
            currentUser
        });
    } catch (err) {
        console.error('Error:', err);
        req.flash('error', 'Invalid listing ID');
        res.redirect('/listings');
    }
});

// Create Route
app.post("/listings", upload.array('image', 5), async(req, res) => {
    try {
        console.log('Uploaded files:', req.files);
        
        const listingData = { ...req.body.listing };
        listingData.price = Math.max(0, parseInt(listingData.price) || 0);
        listingData.status = 'available';
        
        if (!listingData.expiryDate) {
            listingData.expiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        }

        const newListing = new Listing(listingData);
        
        // Handle images using Cloudinary URLs
        if (req.files && req.files.length > 0) {
            console.log('Processing files:', req.files);
            newListing.images = req.files.map(file => ({
                url: file.path,
                filename: file.filename
            }));
            newListing.image = req.files[0].path;
        }

        await newListing.save();
        req.flash('success', 'Successfully created a new listing!');
        res.redirect("/listings");
    } catch (err) {
        console.error('Error creating listing:', err);
        req.flash('error', 'Error creating listing: ' + err.message);
        res.redirect("/listings/new");
    }
});

// Edit Route
app.get("/listings/:id/edit", async(req,res) =>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", {listing});
})

// Update Route
app.put("/listings/:id", async(req,res) =>{
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    res.redirect(`/listings/${id}`);
})

// Delete Route
app.delete("/listings/:id" , async(req,res) => {
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing)
    res.redirect("/listings");

})
// app.get("/testListings" , async (req,res) => {
//     let sampleListing = new Listing({
//         title : "My New Villa",
//         description : "By the beach",
//         price: 1200,
//         location : "Calangute, Goa",
//         country: "India",
//     });
//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("succesfull testing");
// })

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`LocalMart server is listening on port ${PORT}`);
});

// Add Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('New client connected');
    
    socket.on('newListing', (listing) => {
        io.emit('listingAdded', listing);
    });
    
    socket.on('itemReserved', (listingId) => {
        io.emit('updateStatus', { id: listingId, status: 'reserved' });
    });
});

// Add these routes after your existing routes

// Create bundle from existing items
app.post("/listings/:id/create-bundle", async (req, res) => {
    try {
        const { id } = req.params;
        const { bundleItems, bundleDiscount } = req.body;
        
        const listing = await Listing.findById(id);
        listing.bundle = {
            isBundle: true,
            items: bundleItems,
            bundleDiscount: bundleDiscount
        };
        
        await listing.save();
        res.redirect(`/listings/${id}`);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error creating bundle");
    }
});

// Extend listing expiry
app.post("/listings/:id/extend", async (req, res) => {
    try {
        const { id } = req.params;
        const { days } = req.body;
        
        const listing = await Listing.findById(id);
        const newExpiryDate = new Date(listing.expiryDate);
        newExpiryDate.setDate(newExpiryDate.getDate() + parseInt(days));
        
        listing.expiryDate = newExpiryDate;
        await listing.save();
        
        res.redirect(`/listings/${id}`);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error extending listing");
    }
});

// Schedule expiry notifications
setInterval(async () => {
    try {
        const nearExpiryListings = await Listing.find({
            status: 'available',
            expiryDate: {
                $gt: new Date(),
                $lt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
            }
        });
        
        // Here you would typically send notifications to sellers
        // For now, we'll just log them
        nearExpiryListings.forEach(listing => {
            console.log(`Listing "${listing.title}" expires soon!`);
        });
    } catch (err) {
        console.error('Error checking expiry dates:', err);
    }
}, 60 * 60 * 1000); // Check every hour

// Add this after all your routes
app.use((err, req, res, next) => {
    console.error(err.stack);
    if (err instanceof multer.MulterError) {
        res.status(400).render('error', { 
            message: 'File upload error: ' + err.message,
            error: err,
            currentUser: req.session.user || null
        });
    } else {
        res.status(err.status || 500).render('error', { 
            message: err.message || 'Something went wrong!',
            error: err,
            currentUser: req.session.user || null
        });
    }
});

// Add after other middleware
app.use('/api', apiRoutes);

// Add at the end of app.js
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', {
        message: process.env.NODE_ENV === 'production' 
            ? 'Something went wrong!' 
            : err.message,
        error: process.env.NODE_ENV === 'production' ? {} : err
    });
});