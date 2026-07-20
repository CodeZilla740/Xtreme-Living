const axios = require("axios");

const API_KEY = process.env.GEOAPIFY_API_KEY;

async function getCoordinates(location) {
    const url = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(location)}&apiKey=${API_KEY}`;

    const response = await axios.get(url);

    if (response.data.features.length === 0) {
        throw new Error("Location not found");
    }

    const coordinates = response.data.features[0].geometry.coordinates;

    return coordinates; // [longitude, latitude]
}

module.exports = getCoordinates;