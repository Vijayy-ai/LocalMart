const searchInput = document.getElementById('searchInput');
const suggestionsBox = document.getElementById('searchSuggestions');
let debounceTimer;

searchInput.addEventListener('input', function() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        const searchTerm = this.value;
        if (searchTerm.length < 2) {
            suggestionsBox.innerHTML = '';
            return;
        }
        fetchSuggestions(searchTerm);
    }, 300);
});

async function fetchSuggestions(searchTerm) {
    try {
        const response = await fetch(`/api/search-suggestions?term=${searchTerm}`);
        const suggestions = await response.json();
        displaySuggestions(suggestions);
    } catch (err) {
        console.error('Error fetching suggestions:', err);
    }
}

function displaySuggestions(suggestions) {
    suggestionsBox.innerHTML = '';
    if (!suggestions.length) {
        suggestionsBox.style.display = 'none';
        return;
    }

    const ul = document.createElement('ul');
    ul.className = 'suggestions-list';

    suggestions.forEach(suggestion => {
        const li = document.createElement('li');
        li.className = 'suggestion-item';
        li.innerHTML = `
            <div class="suggestion-content">
                <img src="${suggestion.image}" alt="${suggestion.title}" class="suggestion-img">
                <div class="suggestion-info">
                    <div class="suggestion-title">${suggestion.title}</div>
                    <div class="suggestion-price">₹${suggestion.price.toLocaleString('en-IN')}</div>
                </div>
            </div>
        `;
        li.addEventListener('click', () => {
            window.location.href = `/listings/${suggestion._id}`;
        });
        ul.appendChild(li);
    });

    suggestionsBox.appendChild(ul);
    suggestionsBox.style.display = 'block';
}

// Close suggestions when clicking outside
document.addEventListener('click', function(e) {
    if (!searchInput.contains(e.target) && !suggestionsBox.contains(e.target)) {
        suggestionsBox.style.display = 'none';
    }
}); 