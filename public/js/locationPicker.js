function initLocationPicker() {
    // Create the search box input
    const input = document.getElementById('location');
    const searchBox = new google.maps.places.SearchBox(input);
    
    const defaultLocation = { lat: 26.9124, lng: 75.7873 }; // Jaipur center
    
    const map = new google.maps.Map(document.getElementById('location-map'), {
        zoom: 13,
        center: defaultLocation,
    });

    const marker = new google.maps.Marker({
        map: map,
        draggable: true
    });

    // Listen for the event when a user selects a prediction
    searchBox.addListener('places_changed', function() {
        const places = searchBox.getPlaces();

        if (places.length === 0) return;

        const place = places[0];
        if (!place.geometry) return;

        // Set marker and center map
        marker.setPosition(place.geometry.location);
        map.setCenter(place.geometry.location);

        // Update hidden fields
        updateLocationFields({
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
            address: place.formatted_address
        });
    });

    // Update on marker drag
    marker.addListener('dragend', function() {
        const position = marker.getPosition();
        reverseGeocode(position);
    });
}

function updateLocationFields(location) {
    document.getElementById('latitude').value = location.lat;
    document.getElementById('longitude').value = location.lng;
    if (location.address) {
        document.getElementById('location').value = location.address;
    }
}

function reverseGeocode(position) {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: position }, (results, status) => {
        if (status === 'OK' && results[0]) {
            updateLocationFields({
                lat: position.lat(),
                lng: position.lng(),
                address: results[0].formatted_address
            });
        }
    });
} 