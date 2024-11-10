let map, infoWindow;

function detectBuyerLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };

                // Center map on user location
                map.setCenter(pos);
                map.setZoom(14);

                // Add marker for user location
                new google.maps.Marker({
                    position: pos,
                    map: map,
                    title: "Your Location",
                    icon: {
                        url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
                    }
                });

                // Fetch nearby listings
                fetchNearbyListings(pos);
            },
            () => {
                handleLocationError(true, infoWindow, map.getCenter());
            }
        );
    } else {
        handleLocationError(false, infoWindow, map.getCenter());
    }
}

function fetchNearbyListings(location) {
    const radius = 5000; // 5km radius
    fetch(`/api/nearby-listings?lat=${location.lat}&lng=${location.lng}&radius=${radius}`)
        .then(response => response.json())
        .then(listings => {
            displayListings(listings);
            addListingMarkers(listings);
        })
        .catch(err => console.error('Error fetching nearby listings:', err));
}

function displayListings(listings) {
    const container = document.getElementById('listings-container');
    if (!listings.length) {
        container.innerHTML = '<div class="alert alert-info">No items found nearby</div>';
        return;
    }

    container.innerHTML = listings.map(listing => `
        <div class="col mb-4">
            <div class="card">
                <img src="${listing.image}" class="card-img-top" alt="${listing.title}">
                <div class="card-body">
                    <h5 class="card-title">${listing.title}</h5>
                    <p class="card-text">₹${listing.price.toLocaleString('en-IN')}</p>
                    <a href="/listings/${listing._id}" class="btn btn-primary">View Details</a>
                </div>
            </div>
        </div>
    `).join('');
}

function addListingMarkers(listings) {
    listings.forEach(listing => {
        if (listing.geometry && listing.geometry.coordinates) {
            const marker = new google.maps.Marker({
                position: {
                    lat: listing.geometry.coordinates[1],
                    lng: listing.geometry.coordinates[0]
                },
                map: map,
                title: listing.title
            });

            const infowindow = new google.maps.InfoWindow({
                content: `
                    <div>
                        <h6>${listing.title}</h6>
                        <p>₹${listing.price.toLocaleString('en-IN')}</p>
                        <a href="/listings/${listing._id}">View Details</a>
                    </div>
                `
            });

            marker.addListener('click', () => {
                infowindow.open(map, marker);
            });
        }
    });
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    const message = browserHasGeolocation
        ? "Error: The Geolocation service failed."
        : "Error: Your browser doesn't support geolocation.";
    alert(message);
} 