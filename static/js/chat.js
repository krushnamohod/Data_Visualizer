class ChatInterface {
    constructor() {
        this.messagesContainer = document.getElementById('ai-chat');
        this.chatInput = document.getElementById('ai-input');
        this.sendButton = document.getElementById('ai-submit');
        
        this.sendMessage = this.sendMessage.bind(this);
        this.addMessage = this.addMessage.bind(this);
        
        this.initializeEventListeners();
        this.isLoading = false;
    }

    initializeEventListeners() {
        // Send button click handler
        this.sendButton.addEventListener('click', async () => {
            if (!this.isLoading) {
                await this.sendMessage();
            }
        });

        // Enter key press handler
        this.chatInput.addEventListener('keypress', async (e) => {
            if (e.key === 'Enter' && !e.shiftKey && !this.isLoading) {
                e.preventDefault();
                await this.sendMessage();
            }
        });
    }

    setLoadingState(loading) {
        this.isLoading = loading;
        this.sendButton.disabled = loading;
        this.chatInput.disabled = loading;
        if (loading) {
            this.sendButton.textContent = 'Sending...';
        } else {
            this.sendButton.textContent = 'Ask';
        }
    }

    async sendMessage() {
        const message = this.chatInput.value.trim();
        if (!message) return;

        try {
            this.setLoadingState(true);
            
            this.chatInput.value = '';
            this.addMessage('user', message);

            // Updated endpoint from /chat to /ai-query
            const response = await fetch('/ai-query', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    query: message
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.success) {
                const formattedResponse = this.formatResponse(data.response);
                this.addMessage('assistant', formattedResponse);
            } else {
                const errorMessage = data.error || 'An unknown error occurred';
                this.addMessage('assistant', `Error: ${errorMessage}`);
            }
        } catch (error) {
            console.error('Chat error:', error);
            this.addMessage('assistant', 'Sorry, there was an error processing your message. Please try again.');
        } finally {
            this.setLoadingState(false);
            this.scrollToBottom();
        }
    }

    formatResponse(response) {
        // Convert markdown-style formatting to HTML
        return response
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>');
    }

    addMessage(role, content) {
        // Create message container
        const messageDiv = document.createElement('div');
        messageDiv.className = `flex ${role === 'user' ? 'justify-end' : 'justify-start'} mb-4`;

        // Create message content
        const messageContent = document.createElement('div');
        messageContent.className = `max-w-[80%] rounded-lg p-3 ${
            role === 'user' ? 'bg-blue-100' : 'bg-gray-100'
        }`;
        messageContent.innerHTML = content;

        // Create timestamp
        const timestamp = document.createElement('div');
        timestamp.className = 'text-xs text-gray-500 mt-1';
        timestamp.textContent = new Date().toLocaleTimeString();

        // Assemble message
        const messageWrapper = document.createElement('div');
        messageWrapper.className = 'flex flex-col';
        messageWrapper.appendChild(messageContent);
        messageWrapper.appendChild(timestamp);
        messageDiv.appendChild(messageWrapper);

        // Add to chat container
        this.messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
    }

    scrollToBottom() {
        // Smooth scroll to bottom
        this.messagesContainer.scrollTo({
            top: this.messagesContainer.scrollHeight,
            behavior: 'smooth'
        });
    }

    displayInitialInsights(insights) {
        if (insights) {
            const formattedInsights = this.formatResponse(insights);
            this.addMessage('assistant', formattedInsights);
        }
    }

    clearChat() {
        while (this.messagesContainer.firstChild) {
            this.messagesContainer.removeChild(this.messagesContainer.firstChild);
        }
    }

    displayError(error) {
        const errorMessage = typeof error === 'string' ? error : 'An error occurred';
        this.addMessage('assistant', `<span class="text-red-500">${errorMessage}</span>`);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.chatInterface = new ChatInterface();
});