class SmartPricing {
    constructor() {
        this.form = document.getElementById('listing-form');
        this.priceInput = document.getElementById('price-input');
        this.categorySelect = document.getElementById('category-select');
        this.conditionSelect = document.getElementById('condition-select');
        this.locationInput = document.getElementById('location-input');
        this.suggestedPriceDisplay = document.getElementById('suggested-price');
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupPriceChart();
        this.initializePriceHistory();
    }

    setupEventListeners() {
        const inputs = [this.categorySelect, this.conditionSelect, this.locationInput];
        inputs.forEach(input => {
            input?.addEventListener('change', () => this.updateSuggestedPrice());
        });

        this.priceInput?.addEventListener('input', () => this.providePriceFeedback());
    }

    async updateSuggestedPrice() {
        const category = this.categorySelect?.value;
        const condition = this.conditionSelect?.value;
        const location = this.locationInput?.value;

        if (!category || !condition || !location) return;

        try {
            this.suggestedPriceDisplay.innerHTML = '<div class="loading">Calculating...</div>';

            const response = await fetch('/api/suggested-price', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ category, condition, location })
            });

            if (!response.ok) throw new Error('Failed to get price suggestion');

            const data = await response.json();
            this.displaySuggestedPrice(data.suggestedPrice, data.priceRange);
            this.updatePriceChart(data.similarListings);
        } catch (err) {
            console.error('Error getting price suggestion:', err);
            this.suggestedPriceDisplay.innerHTML = `
                <div class="error-message">
                    Unable to calculate price suggestion. Please try again.
                </div>
            `;
        }
    }

    displaySuggestedPrice(price, range) {
        if (!this.suggestedPriceDisplay) return;

        this.suggestedPriceDisplay.innerHTML = `
            <div class="suggested-price-container" role="region" aria-label="Price Suggestion">
                <h5 id="price-range-label">Suggested Price Range</h5>
                <div class="price-range" role="group" aria-labelledby="price-range-label">
                    <span aria-label="Minimum price">₹${range.min.toLocaleString('en-IN')}</span>
                    <div class="price-slider" role="progressbar" 
                         aria-valuemin="${range.min}" 
                         aria-valuemax="${range.max}" 
                         aria-valuenow="${price}">
                        <div class="optimal-range" 
                             style="left: ${range.optimal.min}%; right: ${100 - range.optimal.max}%"
                             aria-label="Optimal price range"></div>
                    </div>
                    <span aria-label="Maximum price">₹${range.max.toLocaleString('en-IN')}</span>
                </div>
                <div class="optimal-price">
                    <span aria-label="Recommended price">
                        Recommended: ₹${price.toLocaleString('en-IN')}
                    </span>
                    <button class="btn btn-sm btn-outline-success ms-2" 
                            onclick="this.applyPrice(${price})"
                            aria-label="Apply recommended price">
                        Apply
                    </button>
                </div>
            </div>
        `;
    }

    applyPrice(price) {
        if (this.priceInput) {
            this.priceInput.value = price;
            this.providePriceFeedback();
        }
    }

    providePriceFeedback() {
        const currentPrice = parseFloat(this.priceInput?.value);
        const suggestedPrice = this.getSuggestedPrice();

        if (!currentPrice || !suggestedPrice) return;

        const difference = ((currentPrice - suggestedPrice) / suggestedPrice) * 100;
        let feedback = '';
        let className = '';

        if (Math.abs(difference) <= 10) {
            feedback = 'Price is competitive';
            className = 'text-success';
        } else if (difference > 10) {
            feedback = 'Price might be too high for quick sale';
            className = 'text-warning';
        } else {
            feedback = 'Price is below market average';
            className = 'text-danger';
        }

        this.displayPriceFeedback(feedback, className);
    }

    displayPriceFeedback(message, className) {
        const feedbackElement = document.getElementById('price-feedback');
        if (feedbackElement) {
            feedbackElement.className = `price-feedback ${className}`;
            feedbackElement.textContent = message;
        }
    }

    setupPriceChart() {
        const ctx = document.getElementById('price-history-chart')?.getContext('2d');
        if (!ctx) return;

        this.priceChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Average Price Trend',
                    data: [],
                    borderColor: '#007bff',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: value => '₹' + value.toLocaleString('en-IN')
                        }
                    }
                }
            }
        });
    }

    async initializePriceHistory() {
        try {
            const category = this.categorySelect?.value;
            if (!category) return;

            const response = await fetch(`/api/price-history/${encodeURIComponent(category)}`);
            const data = await response.json();
            
            this.updatePriceChart(data);
        } catch (err) {
            console.error('Error fetching price history:', err);
        }
    }

    updatePriceChart(data) {
        if (!this.priceChart) return;

        this.priceChart.data.labels = data.dates;
        this.priceChart.data.datasets[0].data = data.prices;
        this.priceChart.update();
    }

    getSuggestedPrice() {
        const priceElement = document.querySelector('.optimal-price');
        if (!priceElement) return null;

        const priceText = priceElement.textContent.match(/₹([\d,]+)/);
        return priceText ? parseFloat(priceText[1].replace(/,/g, '')) : null;
    }
}

// Initialize smart pricing when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SmartPricing();
}); 