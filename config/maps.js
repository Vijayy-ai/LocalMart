const GOOGLE_MAPS_API_KEY = 'AIzaSyDEhUG5AT4xA-7UaVg4z7jxOXSb3b3l0sc';
const GEOLOCATION_API_KEY = 'AIzaSyAbXvJCAfA2hAou_aZZwpUPY_M5aJ21xOk';

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