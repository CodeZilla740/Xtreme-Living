const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError.js');
const listingRoutes = require('./routes/listing.js');
const reviewRoutes = require('./routes/review.js');

app.use(methodOverride('_method'));
app.engine('ejs', ejsMate);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
// app.use(express.static(path.join(__dirname, '/public')));

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

app.get('/', (req, res) => {
    res.send('ROOT!');
});

app.use('/listings', listingRoutes);
app.use('/listings/:id/reviews', reviewRoutes);


app.use((req, res, next) => {
    next(new ExpressError(404, 'Page Not Found'));
});


app.use((err,req,res,next) => {
    let { statusCode = 500, message = 'Something went wrong!' } = err;
    
    // Handle Mongoose CastError (invalid ObjectId)
    // if (err.name === 'CastError') {
    //     statusCode = 404;
    //     message = 'Listing not found';
    // }
    res.status(statusCode).render('listings/error.ejs', { message });
    // res.status(statusCode).send(message);
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});