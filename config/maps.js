const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const GEOLOCATION_API_KEY = process.env.GEOLOCATION_API_KEY;

module.exports = {
    GOOGLE_MAPS_API_KEY,
    GEOLOCATION_API_KEY,
    defaultCenter: {
        lat: 26.9124,
        lng: 75.7873 // Jaipur coordinates
    },
    defaultZoom: 13,
    maxRadius: 5000, // 5km in meters
    clusterStyles: {
        imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'
    }
}; 