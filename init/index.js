const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = 'mongodb://127.0.0.1:27017/wanderlust';

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
        // Close the connection in either case
        await mongoose.connection.close();
        console.log("Connection closed");
        // Exit the process
        process.exit(0);
    }
}

const initDB = async() => {
    try {
        await Listing.deleteMany({});
        await Listing.insertMany(initData.data);
        console.log("Data was initialized");
    } catch (err) {
        console.error("Error during initialization:");
        console.error(err);
        throw err; // Re-throw to be caught by main()
    }
}

// Run the main function
main();
