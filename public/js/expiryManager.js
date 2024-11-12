function checkExpiryDates() {
    const listings = document.querySelectorAll('.listing-card');
    
    listings.forEach(listing => {
        const expiryDate = new Date(listing.dataset.expiry);
        const timeRemaining = expiryDate - new Date();
        const daysRemaining = Math.ceil(timeRemaining / (1000 * 60 * 60 * 24));
        
        const timeRemainingElement = listing.querySelector('.time-remaining');
        
        if (daysRemaining <= 3) {
            timeRemainingElement.classList.add('expiring-soon');
            if (daysRemaining <= 1) {
                timeRemainingElement.innerHTML = `<i class="fas fa-clock"></i> Expires in ${daysRemaining} day!`;
            } else {
                timeRemainingElement.innerHTML = `<i class="fas fa-clock"></i> Expires in ${daysRemaining} days`;
            }
        }
    });
}

// Check expiry dates every minute
setInterval(checkExpiryDates, 60000);
document.addEventListener('DOMContentLoaded', checkExpiryDates); 