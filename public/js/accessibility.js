class AccessibilityHelper {
    constructor() {
        this.setupKeyboardNavigation();
        this.setupScreenReaderAnnouncements();
        this.setupFocusManagement();
    }

    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Skip to main content
            if (e.key === 'Tab' && e.altKey) {
                e.preventDefault();
                document.querySelector('main')?.focus();
            }

            // Close modals with Escape
            if (e.key === 'Escape') {
                this.handleEscapeKey();
            }
        });
    }

    setupScreenReaderAnnouncements() {
        this.announcer = document.createElement('div');
        this.announcer.setAttribute('aria-live', 'polite');
        this.announcer.className = 'sr-only';
        document.body.appendChild(this.announcer);
    }

    announce(message) {
        this.announcer.textContent = message;
    }

    setupFocusManagement() {
        // Trap focus in modals
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('keydown', (e) => {
                if (e.key === 'Tab') {
                    this.trapFocus(e, modal);
                }
            });
        });
    }

    trapFocus(e, element) {
        const focusableElements = element.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
            if (document.activeElement === firstFocusable) {
                lastFocusable.focus();
                e.preventDefault();
            }
        } else {
            if (document.activeElement === lastFocusable) {
                firstFocusable.focus();
                e.preventDefault();
            }
        }
    }

    handleEscapeKey() {
        const modal = document.querySelector('.modal.show');
        if (modal) {
            const closeBtn = modal.querySelector('[data-bs-dismiss="modal"]');
            closeBtn?.click();
        }
    }
}

// Initialize accessibility helper
document.addEventListener('DOMContentLoaded', () => {
    window.accessibilityHelper = new AccessibilityHelper();
}); 