const Listing = require('../models/listing');

module.exports.index = async (req, res, next) => {
    const allListings = await Listing.find({});
    res.render('listings/index.ejs', { allListings });
}

module.exports.renderNewForm = (req, res) => {
    res.render('listings/new.ejs');
}

module.exports.showListing = async (req, res, next) => {
    const { id } = req.params;
    const listing = await Listing.findById(id).populate({path: 'reviews', populate: {path: 'author'}}).populate("owner");
    if(!listing) {
        req.flash("error", "Cannot find that listing!");
        return res.redirect('/listings');
    }
    // console.log(listing);
    return res.render('listings/show.ejs', { listing });
}

module.exports.createListing = async (req, res, next) => {
    let url = req.file.path;
    let filename = req.file.filename;
    const { listing } = req.body;
    const newListing = new Listing({
        ...listing,
        image: {
            filename: "",
            url: listing.image
        }
    });
    newListing.owner = req.user._id;
    newListing.image = {url,filename};
    await newListing.save();
    req.flash("success", "Successfully created a new listing!");
    res.redirect('/listings');
}

module.exports.renderEditForm = async (req, res, next) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if(!listing) {
        req.flash("error", "Cannot find that listing!");
        return res.redirect('/listings');
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
    res.render('listings/edit.ejs', { listing, originalImageUrl });
}

module.exports.updateListing = async (req, res, next) => {
    const { id } = req.params;
    const { listing } = req.body;
    let updatedListing = await Listing.findByIdAndUpdate(id, {
        ...listing,
        image: {
            filename: "",
            url: listing.image
        }
    });
    if(typeof req.file !== 'undefined') {
        let url = req.file.path;
        let filename = req.file.filename;
        updatedListing.image = {url,filename};
        await updatedListing.save();
    }
    req.flash("success", "Successfully updated the listing!");
    res.redirect(`/listings/${id}`);
}

module.exports.destroyListing = async (req, res, next) => {
    const { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    req.flash("success", "Successfully deleted the listing!");
    res.redirect('/listings');
}