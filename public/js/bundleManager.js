document.addEventListener('DOMContentLoaded', function() {
    const bundleCheck = document.getElementById('bundleCheck');
    const bundleDetails = document.getElementById('bundleDetails');

    if (bundleCheck) {
        bundleCheck.addEventListener('change', function() {
            bundleDetails.style.display = this.checked ? 'block' : 'none';
        });
    }

    // Calculate and display bundle savings
    function updateBundlePrice() {
        const basePrice = parseFloat(document.querySelector('input[name="listing[price]"]').value) || 0;
        const discount = parseFloat(document.querySelector('input[name="listing[bundle][bundleDiscount]"]').value) || 0;
        const savings = (basePrice * discount) / 100;
        
        const savingsDisplay = document.getElementById('bundle-savings');
        if (savingsDisplay) {
            savingsDisplay.textContent = `Save ₹${savings.toLocaleString('en-IN')}!`;
        }
    }

    // Add event listeners for price calculations
    const priceInput = document.querySelector('input[name="listing[price]"]');
    const discountInput = document.querySelector('input[name="listing[bundle][bundleDiscount]"]');

    if (priceInput && discountInput) {
        priceInput.addEventListener('input', updateBundlePrice);
        discountInput.addEventListener('input', updateBundlePrice);
    }
}); 