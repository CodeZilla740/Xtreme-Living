const mongoose = require('mongoose');
const review = require('./review');
const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,
    image: {
        filename: String,
        url: {
            type: String,
            default: "https://unsplash.com/photos/brown-wooden-house-in-the-middle-of-forest-during-daytime-jo8pclRHmCI",
            set: (value) => value==="" 
            ? "https://unsplash.com/photos/brown-wooden-house-in-the-middle-of-forest-during-daytime-jo8pclRHmCI" 
            : value,
        },
        
    },
    price: Number,
    location: String,
    country: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
});

listingSchema.post('findOneAndDelete', async (listing) => {
    if(listing) {
        await review.deleteMany({ _id: { $in: listing.reviews } });
    }
});

const Listing = mongoose.model('Listing', listingSchema);
module.exports = Listing;