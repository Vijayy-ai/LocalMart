class Chat {
    constructor(chatId, currentUserId) {
        this.socket = io();
        this.chatId = chatId;
        this.currentUserId = currentUserId;
        this.messageQueue = [];
        this.isTyping = false;
        this.typingTimeout = null;
        
        this.init();
    }

    init() {
        this.socket.emit('joinChat', this.chatId);
        this.setupEventListeners();
        this.loadChatHistory();
        this.setupQuickReplies();
    }

    setupEventListeners() {
        // Message input handling
        const input = document.getElementById('message-input');
        const sendBtn = document.getElementById('send-button');

        input?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
            this.handleTyping();
        });

        sendBtn?.addEventListener('click', () => this.sendMessage());

        // Socket event listeners
        this.socket.on('message', (message) => this.handleIncomingMessage(message));
        this.socket.on('userTyping', (userId) => this.showTypingIndicator(userId));
        this.socket.on('stopTyping', (userId) => this.hideTypingIndicator(userId));
    }

    async loadChatHistory() {
        try {
            const response = await fetch(`/api/chats/${this.chatId}/messages`);
            const messages = await response.json();
            messages.forEach(msg => this.appendMessage(msg));
        } catch (err) {
            console.error('Error loading chat history:', err);
        }
    }

    sendMessage() {
        const input = document.getElementById('message-input');
        if (!input?.value.trim()) return;

        const message = {
            chatId: this.chatId,
            content: input.value,
            sender: this.currentUserId,
            timestamp: new Date()
        };

        this.socket.emit('newMessage', message);
        this.appendMessage(message);
        input.value = '';
    }

    handleIncomingMessage(message) {
        if (message.chatId === this.chatId && message.sender !== this.currentUserId) {
            this.appendMessage(message);
            this.playNotificationSound();
        }
    }

    appendMessage(message) {
        const chatBox = document.getElementById('chat-messages');
        if (!chatBox) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${message.sender === this.currentUserId ? 'sent' : 'received'}`;
        
        messageDiv.innerHTML = `
            <div class="message-content">${this.formatMessageContent(message.content)}</div>
            <div class="message-time">${this.formatTimestamp(message.timestamp)}</div>
        `;
        
        chatBox.appendChild(messageDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    formatMessageContent(content) {
        // Convert URLs to links
        content = content.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
        // Convert emojis
        content = content.replace(/:\)|:\(|:D|:P/g, match => {
            const emojis = {':)': '😊', ':(': '😢', ':D': '😃', ':P': '😛'};
            return emojis[match];
        });
        return content;
    }

    formatTimestamp(timestamp) {
        return new Date(timestamp).toLocaleTimeString();
    }

    handleTyping() {
        if (!this.isTyping) {
            this.isTyping = true;
            this.socket.emit('typing', this.chatId);
        }

        clearTimeout(this.typingTimeout);
        this.typingTimeout = setTimeout(() => {
            this.isTyping = false;
            this.socket.emit('stopTyping', this.chatId);
        }, 1000);
    }

    showTypingIndicator(userId) {
        if (userId === this.currentUserId) return;
        
        const typingDiv = document.getElementById('typing-indicator');
        if (typingDiv) {
            typingDiv.style.display = 'block';
        }
    }

    hideTypingIndicator(userId) {
        if (userId === this.currentUserId) return;
        
        const typingDiv = document.getElementById('typing-indicator');
        if (typingDiv) {
            typingDiv.style.display = 'none';
        }
    }

    playNotificationSound() {
        const audio = new Audio('/sounds/notification.mp3');
        audio.play().catch(err => console.log('Error playing notification:', err));
    }

    setupQuickReplies() {
        const quickReplies = [
            'Is this still available?',
            'What\'s your best price?',
            'Can we meet today?',
            'Location shared',
            'Thanks!'
        ];

        const container = document.createElement('div');
        container.className = 'quick-replies';
        
        quickReplies.forEach(reply => {
            const button = document.createElement('button');
            button.className = 'quick-reply-btn';
            button.textContent = reply;
            button.onclick = () => {
                document.getElementById('message-input').value = reply;
                this.sendMessage();
            };
            container.appendChild(button);
        });
        
        document.querySelector('.chat-input')?.prepend(container);
    }
}

// Initialize chat if elements exist
document.addEventListener('DOMContentLoaded', () => {
    const chatId = document.getElementById('chat-container')?.dataset.chatId;
    const currentUserId = document.getElementById('chat-container')?.dataset.userId;
    
    if (chatId && currentUserId) {
        new Chat(chatId, currentUserId);
    }
}); 