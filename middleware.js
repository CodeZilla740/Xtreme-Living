const Listing = require('./models/listing');
const Review = require('./models/review');
const { listingSchema, reviewSchema } = require('./schema.js');
const ExpressError = require('./utils/ExpressError.js');

module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You must be logged in to create a listing!");
        return res.redirect('/login');
    }
    next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
    if(req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

module.exports.isOwner = async (req, res, next) => {
    const { id } = req.params;
    // const { listing } = req.body;
    let listingOwner= await Listing.findById(id);
    if(!listingOwner.owner.equals(res.locals.currentUser._id)) {
        req.flash("error", "You do not have permission to do that!");
        return res.redirect(`/listings/${id}`);
    }
    next();
}

module.exports.validateListing = (req, res, next) => {
    let {error} = listingSchema.validate(req.body);
        
    if(error) {
        let errMsg = error.details.map(el => el.message).join(',');
        throw new ExpressError(errMsg, 400);
    }
    else {
        next();
    }
}

module.exports.validateReview = (req, res, next) => {
    let {error} = reviewSchema.validate(req.body);
    
    if(error) {
        let errMsg = error.details.map(el => el.message).join(',');
        throw new ExpressError(errMsg, 400);
    }
    else {
        next();
    }
};

module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    // const { listing } = req.body;
    let reviewAuthor= await Review.findById(reviewId);
    if(!reviewAuthor.author.equals(res.locals.currentUser._id)) {
        req.flash("error", "You do not have permission to do that!");
        return res.redirect(`/listings/${id}`);
    }
    next();
}