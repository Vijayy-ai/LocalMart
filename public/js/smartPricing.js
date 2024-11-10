async function getSuggestedPrice() {
    const category = document.querySelector('select[name="listing[category]"]').value;
    const condition = document.querySelector('select[name="listing[condition]"]').value;
    const location = document.querySelector('input[name="listing[location]"]').value;

    if (!category || !condition || !location) return;

    try {
        const response = await fetch('/api/suggested-price', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                category,
                condition,
                location
            })
        });

        const data = await response.json();
        
        if (data.suggestedPrice) {
            const priceInput = document.querySelector('input[name="listing[price]"]');
            const suggestedPriceDisplay = document.getElementById('suggested-price');
            
            suggestedPriceDisplay.textContent = `Suggested Price: ₹${data.suggestedPrice.toLocaleString('en-IN')}`;
            suggestedPriceDisplay.style.display = 'block';
            
            // Add a button to apply suggested price
            const applyButton = document.createElement('button');
            applyButton.textContent = 'Apply Suggested Price';
            applyButton.className = 'btn btn-sm btn-outline-success ms-2';
            applyButton.onclick = (e) => {
                e.preventDefault();
                priceInput.value = data.suggestedPrice;
            };
            suggestedPriceDisplay.appendChild(applyButton);
        }
    } catch (err) {
        console.error('Error getting suggested price:', err);
    }
}

// Add event listeners to trigger price suggestion
document.querySelectorAll('select[name="listing[category]"], select[name="listing[condition]"], input[name="listing[location]"]')
    .forEach(element => {
        element.addEventListener('change', getSuggestedPrice);
    }); 