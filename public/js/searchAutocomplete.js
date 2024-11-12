class SearchAutocomplete {
    constructor() {
        this.searchInput = document.getElementById('searchInput');
        this.suggestionsBox = document.getElementById('searchSuggestions');
        this.debounceTimer = null;
        this.minChars = 2;
        this.initEventListeners();
    }

    initEventListeners() {
        this.searchInput?.addEventListener('input', () => {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = setTimeout(() => this.handleInput(), 300);
        });

        // Close suggestions on click outside
        document.addEventListener('click', (e) => {
            if (!this.searchInput?.contains(e.target) && !this.suggestionsBox?.contains(e.target)) {
                this.hideSuggestions();
            }
        });

        // Keyboard navigation
        this.searchInput?.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    async handleInput() {
        const searchTerm = this.searchInput.value;
        if (searchTerm.length < this.minChars) {
            this.hideSuggestions();
            return;
        }
        
        try {
            const suggestions = await this.fetchSuggestions(searchTerm);
            this.displaySuggestions(suggestions);
        } catch (err) {
            console.error('Error fetching suggestions:', err);
        }
    }

    async fetchSuggestions(searchTerm) {
        const response = await fetch(`/api/search-suggestions?term=${encodeURIComponent(searchTerm)}`);
        if (!response.ok) throw new Error('Failed to fetch suggestions');
        return await response.json();
    }

    displaySuggestions(suggestions) {
        if (!this.suggestionsBox) return;
        
        if (!suggestions.length) {
            this.hideSuggestions();
            return;
        }

        this.suggestionsBox.innerHTML = '';
        const ul = document.createElement('ul');
        ul.className = 'suggestions-list';

        suggestions.forEach((suggestion, index) => {
            const li = this.createSuggestionItem(suggestion, index);
            ul.appendChild(li);
        });

        this.suggestionsBox.appendChild(ul);
        this.showSuggestions();
    }

    createSuggestionItem(suggestion, index) {
        const li = document.createElement('li');
        li.className = 'suggestion-item';
        li.dataset.index = index;
        li.innerHTML = `
            <div class="suggestion-content">
                <img src="${suggestion.image}" alt="${suggestion.title}" class="suggestion-img">
                <div class="suggestion-info">
                    <div class="suggestion-title">${this.highlightMatch(suggestion.title)}</div>
                    <div class="suggestion-price">₹${suggestion.price.toLocaleString('en-IN')}</div>
                    ${suggestion.category ? `<div class="suggestion-category">${suggestion.category}</div>` : ''}
                </div>
            </div>
        `;
        
        li.addEventListener('click', () => this.handleSuggestionClick(suggestion));
        return li;
    }

    highlightMatch(text) {
        const searchTerm = this.searchInput.value;
        const regex = new RegExp(`(${searchTerm})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    handleSuggestionClick(suggestion) {
        window.location.href = `/listings/${suggestion._id}`;
    }

    handleKeyboard(e) {
        const items = this.suggestionsBox?.querySelectorAll('.suggestion-item');
        if (!items?.length) return;

        const current = this.suggestionsBox.querySelector('.suggestion-item.selected');
        let next;

        switch(e.key) {
            case 'ArrowDown':
                e.preventDefault();
                if (!current) {
                    next = items[0];
                } else {
                    next = current.nextElementSibling || items[0];
                }
                break;
            case 'ArrowUp':
                e.preventDefault();
                if (!current) {
                    next = items[items.length - 1];
                } else {
                    next = current.previousElementSibling || items[items.length - 1];
                }
                break;
            case 'Enter':
                if (current) {
                    e.preventDefault();
                    current.click();
                }
                return;
            case 'Escape':
                this.hideSuggestions();
                return;
        }

        if (next) {
            current?.classList.remove('selected');
            next.classList.add('selected');
            next.scrollIntoView({ block: 'nearest' });
        }
    }

    showSuggestions() {
        if (this.suggestionsBox) {
            this.suggestionsBox.style.display = 'block';
        }
    }

    hideSuggestions() {
        if (this.suggestionsBox) {
            this.suggestionsBox.style.display = 'none';
        }
    }
}

// Initialize search autocomplete
document.addEventListener('DOMContentLoaded', () => {
    new SearchAutocomplete();
}); 