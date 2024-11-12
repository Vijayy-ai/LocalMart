class NotificationSystem {
    constructor() {
        this.socket = io();
        this.notificationBell = document.getElementById('notification-bell');
        this.notificationCount = document.getElementById('notification-count');
        this.notificationList = document.getElementById('notification-list');
        this.unreadCount = 0;
        
        this.init();
    }

    init() {
        this.setupSocketListeners();
        this.setupEventListeners();
        this.loadNotifications();
        this.requestNotificationPermission();
    }

    setupSocketListeners() {
        this.socket.on('newNotification', (notification) => {
            this.handleNewNotification(notification);
        });

        this.socket.on('listingUpdate', (data) => {
            this.handleListingUpdate(data);
        });
    }

    setupEventListeners() {
        this.notificationBell?.addEventListener('click', () => {
            this.toggleNotificationList();
        });

        document.addEventListener('click', (e) => {
            if (!this.notificationBell?.contains(e.target) && 
                !this.notificationList?.contains(e.target)) {
                this.hideNotificationList();
            }
        });
    }

    async loadNotifications() {
        try {
            const response = await fetch('/api/notifications');
            const notifications = await response.json();
            
            this.unreadCount = notifications.filter(n => !n.read).length;
            this.updateNotificationCount();
            this.renderNotifications(notifications);
        } catch (err) {
            console.error('Error loading notifications:', err);
        }
    }

    handleNewNotification(notification) {
        this.addNotificationToList(notification);
        this.unreadCount++;
        this.updateNotificationCount();
        this.showDesktopNotification(notification);
    }

    handleListingUpdate(data) {
        const { listingId, status, action } = data;
        const notification = {
            type: 'listing_update',
            message: this.getListingUpdateMessage(action, status),
            listingId
        };
        this.handleNewNotification(notification);
    }

    getListingUpdateMessage(action, status) {
        const messages = {
            reserve: 'Your item has been reserved',
            purchase: 'Your item has been purchased',
            expire: 'Your listing is about to expire',
            price_drop: 'Similar items have dropped in price'
        };
        return messages[action] || 'Your listing has been updated';
    }

    addNotificationToList(notification) {
        if (!this.notificationList) return;

        const notificationElement = document.createElement('div');
        notificationElement.className = 'notification-item' + (notification.read ? '' : ' unread');
        notificationElement.innerHTML = `
            <div class="notification-content">
                <div class="notification-message">${notification.message}</div>
                <div class="notification-time">${this.formatTime(notification.timestamp)}</div>
            </div>
            <button class="notification-action" onclick="handleNotificationAction('${notification.id}')">
                <i class="fas fa-chevron-right"></i>
            </button>
        `;

        this.notificationList.insertBefore(notificationElement, this.notificationList.firstChild);
    }

    updateNotificationCount() {
        if (this.notificationCount) {
            this.notificationCount.textContent = this.unreadCount;
            this.notificationCount.style.display = this.unreadCount > 0 ? 'block' : 'none';
        }
    }

    async markAsRead(notificationId) {
        try {
            await fetch(`/api/notifications/${notificationId}/read`, { method: 'POST' });
            this.unreadCount = Math.max(0, this.unreadCount - 1);
            this.updateNotificationCount();
        } catch (err) {
            console.error('Error marking notification as read:', err);
        }
    }

    toggleNotificationList() {
        if (this.notificationList) {
            const isVisible = this.notificationList.style.display === 'block';
            this.notificationList.style.display = isVisible ? 'none' : 'block';
        }
    }

    hideNotificationList() {
        if (this.notificationList) {
            this.notificationList.style.display = 'none';
        }
    }

    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;

        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return date.toLocaleDateString();
    }

    async requestNotificationPermission() {
        if (!('Notification' in window)) return;

        try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                console.log('Notification permission granted');
            }
        } catch (err) {
            console.error('Error requesting notification permission:', err);
        }
    }

    showDesktopNotification(notification) {
        if (!('Notification' in window) || Notification.permission !== 'granted') return;

        new Notification('LocalMart', {
            body: notification.message,
            icon: '/images/logo.png'
        });
    }
}

// Initialize notification system
document.addEventListener('DOMContentLoaded', () => {
    new NotificationSystem();
}); 