const socket = io();
let currentChat = null;

function initChat(chatId) {
    currentChat = chatId;
    socket.emit('joinChat', chatId);
}

function sendMessage(content) {
    if (!currentChat) return;
    
    socket.emit('newMessage', {
        chatId: currentChat,
        content: content
    });

    // Add message to UI immediately
    appendMessage({
        content,
        sender: currentUserId,
        timestamp: new Date()
    });
}

function appendMessage(message) {
    const chatBox = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${message.sender === currentUserId ? 'sent' : 'received'}`;
    
    messageDiv.innerHTML = `
        <div class="message-content">${message.content}</div>
        <div class="message-time">${new Date(message.timestamp).toLocaleTimeString()}</div>
    `;
    
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Listen for new messages
socket.on('message', (message) => {
    if (message.chatId === currentChat) {
        appendMessage(message);
    }
}); 