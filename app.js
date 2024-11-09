const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

const MONGO_URL = 'mongodb://127.0.0.1:27017/localmart';

main().then(() => {
    console.log("connected to Database");
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
app.get("/listings/:id" , async (req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs", {listing});
})

// Create Route
app.post("/listings", async(req,res) => {
    // let {title, description, image , price, country , location} = req.body;
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
})

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

app.listen(8080, () => {
    console.log("LocalMart server is listening on port 8080");
})