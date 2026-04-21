const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Listing = require('./models/listing.js');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const wrapAsync = require('./utils/wrapAsync.js');
const ExpressError = require('./utils/ExpressError.js');
const { listingSchema } = require('./schema.js');
const review = require('./models/review.js');
const { reviewSchema } = require('./schema.js');
const listingRoutes = require('./routes/listing.js');

app.use(methodOverride('_method'));
app.engine('ejs', ejsMate);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, '/public')));

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



const validateReview = (req, res, next) => {
    let {error} = reviewSchema.validate(req.body);
    
    if(error) {
        let errMsg = error.details.map(el => el.message).join(',');
        throw new ExpressError(errMsg, 400);
    }
    else {
        next();
    }
};

app.use('/listings', listingRoutes);


//Reviews
app.post('/listings/:id/reviews', validateReview, wrapAsync(async (req, res, next) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new review(req.body.review);
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    res.redirect(`/listings/${listing._id}`);
}));

app.delete('/listings/:id/reviews/:reviewId', wrapAsync(async (req, res, next) => {
    const { id, reviewId } = req.params;
    
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await review.findByIdAndDelete(reviewId);
    res.redirect(`/listings/${id}`);
}));

// app.get('/testListing', async (req, res) => {
//     let sampleListing = new Listing({
//         title: "My new Villa",
//         description: "A beautiful villa with a pool and a garden.",
//         price: 500000,
//         location: "Los Angeles",
//         country: "USA"
//     });
//     await sampleListing.save();
//     console.log('Sample listing saved to database');
//     res.send('Successful Testing!');
// });



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

app.use((req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});