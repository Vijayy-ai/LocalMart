class ErrorBoundary {
    constructor() {
        this.errorContainer = document.createElement('div');
        this.errorContainer.className = 'error-boundary';
        this.setupGlobalErrorHandler();
    }

    setupGlobalErrorHandler() {
        window.onerror = (message, source, lineno, colno, error) => {
            this.handleError(error || new Error(message));
            return true;
        };

        window.addEventListener('unhandledrejection', (event) => {
            this.handleError(event.reason);
        });
    }

    handleError(error) {
        console.error('Application error:', error);
        
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        errorMessage.innerHTML = `
            <div class="error-content" role="alert">
                <h3>Something went wrong</h3>
                <p>${error.message || 'An unexpected error occurred'}</p>
                <button onclick="location.reload()" class="btn btn-primary">
                    Refresh Page
                </button>
            </div>
        `;

        this.errorContainer.appendChild(errorMessage);
        document.body.appendChild(this.errorContainer);
    }
}

// Initialize error boundary
new ErrorBoundary(); 