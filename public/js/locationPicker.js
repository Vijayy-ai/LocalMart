class LocationPicker {
    constructor(options = {}) {
        this.map = null;
        this.marker = null;
        this.geocoder = null;
        this.defaultLocation = options.defaultLocation || { lat: 26.9124, lng: 75.7873 }; // Jaipur
        this.zoom = options.zoom || 13;
        this.searchInput = document.getElementById('location-search');
        this.latInput = document.getElementById('latitude');
        this.lngInput = document.getElementById('longitude');
        this.mapContainer = document.getElementById('location-map');
        
        this.init();
    }

    init() {
        // Initialize map
        this.initializeMap();
        
        // Initialize geocoder
        this.geocoder = new google.maps.Geocoder();
        
        // Initialize search box
        this.initializeSearchBox();
        
        // Setup current location button
        this.setupCurrentLocationButton();
    }

    initializeMap() {
        if (!this.mapContainer) return;

        this.map = new google.maps.Map(this.mapContainer, {
            center: this.defaultLocation,
            zoom: this.zoom,
            styles: this.getMapStyles(),
            mapTypeControl: false,
            fullscreenControl: false
        });

        this.marker = new google.maps.Marker({
            map: this.map,
            draggable: true,
            animation: google.maps.Animation.DROP
        });

        // Add marker drag event
        this.marker.addListener('dragend', () => {
            const position = this.marker.getPosition();
            this.updateLocationInputs(position);
            this.reverseGeocode(position);
        });

        // Add map click event
        this.map.addListener('click', (e) => {
            this.marker.setPosition(e.latLng);
            this.updateLocationInputs(e.latLng);
            this.reverseGeocode(e.latLng);
        });
    }

    initializeSearchBox() {
        if (!this.searchInput) return;

        const searchBox = new google.maps.places.SearchBox(this.searchInput);
        
        this.map.addListener('bounds_changed', () => {
            searchBox.setBounds(this.map.getBounds());
        });

        searchBox.addListener('places_changed', () => {
            const places = searchBox.getPlaces();
            if (places.length === 0) return;

            const place = places[0];
            if (!place.geometry) return;

            // Update map and marker
            if (place.geometry.viewport) {
                this.map.fitBounds(place.geometry.viewport);
            } else {
                this.map.setCenter(place.geometry.location);
                this.map.setZoom(17);
            }

            this.marker.setPosition(place.geometry.location);
            this.updateLocationInputs(place.geometry.location);
        });
    }

    setupCurrentLocationButton() {
        const locationBtn = document.createElement('button');
        locationBtn.className = 'current-location-btn';
        locationBtn.innerHTML = '<i class="fas fa-location-arrow"></i>';
        locationBtn.title = 'Use current location';

        this.map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(locationBtn);

        locationBtn.addEventListener('click', () => {
            if (navigator.geolocation) {
                locationBtn.disabled = true;
                locationBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const pos = {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        };

                        this.map.setCenter(pos);
                        this.map.setZoom(17);
                        this.marker.setPosition(pos);
                        this.updateLocationInputs(pos);
                        this.reverseGeocode(pos);

                        locationBtn.disabled = false;
                        locationBtn.innerHTML = '<i class="fas fa-location-arrow"></i>';
                    },
                    (error) => {
                        console.error('Geolocation error:', error);
                        locationBtn.disabled = false;
                        locationBtn.innerHTML = '<i class="fas fa-location-arrow"></i>';
                        alert('Error getting your location. Please try again.');
                    }
                );
            } else {
                alert('Geolocation is not supported by your browser.');
            }
        });
    }

    updateLocationInputs(position) {
        if (this.latInput && this.lngInput) {
            this.latInput.value = position.lat();
            this.lngInput.value = position.lng();
        }
    }

    async reverseGeocode(position) {
        try {
            const response = await this.geocoder.geocode({ location: position });
            if (response.results[0] && this.searchInput) {
                this.searchInput.value = response.results[0].formatted_address;
            }
        } catch (error) {
            console.error('Reverse geocoding error:', error);
        }
    }

    getMapStyles() {
        return [
            {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }]
            },
            {
                featureType: 'transit',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }]
            }
        ];
    }
}

// Initialize location picker when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (typeof google !== 'undefined') {
        new LocationPicker();
    }
}); 