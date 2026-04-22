const express = require('express');
const router = express.Router({mergeParams: true});
const wrapAsync = require('../utils/wrapAsync.js');
const ExpressError = require('../utils/ExpressError.js');
const { reviewSchema } = require('../schema.js');
const review = require('../models/review.js');
const Listing = require('../models/listing.js');


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

//Reviews
router.post('/', validateReview, wrapAsync(async (req, res, next) => {
    console.log(req.params.id);
    let listing = await Listing.findById(req.params.id);
    let newReview = new review(req.body.review);
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    res.redirect(`/listings/${listing._id}`);
}));

router.delete('/:reviewId', wrapAsync(async (req, res, next) => {
    const { id, reviewId } = req.params;
    
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await review.findByIdAndDelete(reviewId);
    res.redirect(`/listings/${id}`);
}));

module.exports = router;