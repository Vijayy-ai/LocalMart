const quickReplies = [
    'Item is available',
    'Item is reserved',
    'When would you like to pick up?',
    'Location shared',
    'Price is firm',
    'Price is negotiable'
];

function addQuickReplies() {
    const container = document.createElement('div');
    container.className = 'quick-replies';
    
    quickReplies.forEach(reply => {
        const button = document.createElement('button');
        button.className = 'quick-reply-btn';
        button.textContent = reply;
        button.onclick = () => sendMessage(reply);
        container.appendChild(button);
    });
    
    document.querySelector('.chat-input').prepend(container);
} 