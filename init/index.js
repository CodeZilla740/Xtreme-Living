const mongoose = require('mongoose');
const initData = require('./data.js');
const Listing = require('../models/listing.js');

const MONGO_URL = 'mongodb://localhost:27017/wanderlust';

main()
    .then(() => {
        console.log('Database connection successful');
    })
    .catch((err) => {
        console.error('Database connection error:', err);
    });

async function main() {
    await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
    await Listing.deleteMany({});
    const docs = initData.data.map((obj) => ({ ...obj, owner: "6a576273f571b205705f6474" }));
    await Listing.insertMany(docs);
    console.log('Database initialized with sample data');
};

initDB();

