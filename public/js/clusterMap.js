function initMap(listings) {
    const map = new google.maps.Map(document.getElementById('cluster-map'), {
        zoom: 3,
        center: { lat: 20.5937, lng: 78.9629 } // India center
    });

    if (!listings || !listings.length) {
        console.log('No listings data available');
        return;
    }

    const markers = listings.filter(listing => listing.geometry && listing.geometry.coordinates)
        .map(listing => {
            try {
                const marker = new google.maps.Marker({
                    position: {
                        lat: listing.geometry.coordinates[1],
                        lng: listing.geometry.coordinates[0]
                    },
                    map: map,
                    title: listing.title
                });

                const infoWindow = new google.maps.InfoWindow({
                    content: `
                        <div>
                            <h6>${listing.title}</h6>
                            <p>₹${listing.price.toLocaleString('en-IN')}</p>
                            <a href="/listings/${listing._id}">View Details</a>
                        </div>
                    `
                });

                marker.addListener('click', () => {
                    infoWindow.open(map, marker);
                });

                return marker;
            } catch (err) {
                console.error('Error creating marker for listing:', listing._id);
                return null;
            }
        }).filter(marker => marker !== null);

    if (markers.length > 0) {
        new MarkerClusterer(map, markers, {
            imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'
        });
    }
} 