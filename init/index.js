const mongoose = require("mongoose");
require('dotenv').config();
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = process.env.MONGODB_URL || 'mongodb://127.0.0.1:27017/localmart';

async function main() {
    try {
        await mongoose.connect(MONGO_URL);
        console.log("Connected to Database");
        
        // Initialize the database
        await initDB();
        
        console.log("Data initialization successful");
    } catch (err) {
        console.error("ERROR:");
        console.error(err);
    } finally {
        await mongoose.connection.close();
        console.log("Connection closed");
        process.exit(0);
    }
}

const initDB = async() => {
    try {
        // Clean the data before insertion
        const cleanData = initData.data.map(item => ({
            ...item,
            range: typeof item.range === 'string' ? 
                parseInt(item.range.replace(/[^0-9]/g, '')) : 
                item.range
        }));

        await Listing.deleteMany({});
        await Listing.insertMany(cleanData);
        console.log("Data was initialized");
    } catch (err) {
        console.error("Error during initialization:");
        console.error(err);
        throw err;
    }
}

// Add this check
if (process.env.INITIALIZE_DB === 'true') {
    require('./init/index.js');
}

main();
