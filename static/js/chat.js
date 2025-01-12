class ChatInterface {
    constructor() {
        this.messagesContainer = document.getElementById('chat-messages');
        this.chatInput = document.getElementById('chat-input');
        this.sendButton = document.getElementById('send-message');
        this.messageTemplate = document.getElementById('message-template');
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
    }

    async sendMessage() {
        const message = this.chatInput.value.trim();
        if (!message) return;

        // Clear input
        this.chatInput.value = '';

        // Add user message to chat
        this.addMessage('user', message);

        try {
            const response = await fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    query: message,
                    filename: window.currentDataset // Set by main dashboard.js
                })
            });

            const data = await response.json();
            if (data.success) {
                this.addMessage('assistant', data.response);
            } else {
                this.addMessage('assistant', 'Sorry, I encountered an error processing your request.');
            }
        } catch (error) {
            console.error('Chat error:', error);
            this.addMessage('assistant', 'Sorry, there was an error processing your message.');
        }
    }

    addMessage(role, content) {
        const messageNode = this.messageTemplate.content.cloneNode(true);
        const messageDiv = messageNode.querySelector('.message');
        const messageContent = messageNode.querySelector('.message-content');
        const messageIcon = messageNode.querySelector('.message-icon');
        const messageTime = messageNode.querySelector('.message-time');

        // Style based on role
        if (role === 'user') {
            messageDiv.classList.add('justify-end');
            messageContent.classList.add('bg-blue-100');
            messageIcon.textContent = 'U';
        } else {
            messageContent.classList.add('bg-gray-100');
            messageIcon.textContent = 'AI';
        }

        // Set content and time
        messageContent.textContent = content;
        messageTime.textContent = new Date().toLocaleTimeString();

        // Add to chat
        this.messagesContainer.appendChild(messageNode);
        this.scrollToBottom();
    }

    scrollToBottom() {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    displayInitialInsights(insights) {
        this.addMessage('assistant', insights);
    }
}

// Initialize chat when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.chatInterface = new ChatInterface();
});