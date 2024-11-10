function initLocationFilter() {
    const filterForm = document.querySelector('.filter-section form');
    
    if ('geolocation' in navigator) {
        const locationBtn = document.createElement('button');
        locationBtn.type = 'button';
        locationBtn.className = 'btn btn-outline-primary';
        locationBtn.innerHTML = '<i class="fas fa-location-arrow"></i> Use My Location';
        locationBtn.onclick = useCurrentLocation;
        
        filterForm.appendChild(locationBtn);
    }
}

function useCurrentLocation() {
    navigator.geolocation.getCurrentPosition(
        position => {
            const { latitude, longitude } = position.coords;
            document.getElementById('buyer-lat').value = latitude;
            document.getElementById('buyer-lng').value = longitude;
            fetchNearbyListings({ lat: latitude, lng: longitude });
        },
        error => {
            console.error('Error getting location:', error);
            alert('Please enable location services to use this feature');
        }
    );
} 