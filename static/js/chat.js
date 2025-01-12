// ChatInterface class to handle the chat functionality
class ChatInterface {
    constructor() {
        // Get references to chat-related elements in the DOM
        this.messagesContainer = document.getElementById('chat-messages'); // Container for chat messages
        this.chatInput = document.getElementById('chat-input'); // Input field for user messages
        this.sendButton = document.getElementById('send-message'); // Button to send messages
        this.messageTemplate = document.getElementById('message-template'); // Template for rendering messages
        
        // Initialize event listeners for user interactions
        this.initializeEventListeners();
    }

    // Set up event listeners for input and button
    initializeEventListeners() {
        // Listen for the 'click' event on the send button
        this.sendButton.addEventListener('click', () => this.sendMessage());

        // Listen for the 'Enter' keypress on the input field to send messages
        this.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
    }

    // Handle sending messages and receiving responses
    async sendMessage() {
        const message = this.chatInput.value.trim(); // Get the trimmed message input
        if (!message) return; // Do nothing if the input is empty

        // Clear the input field
        this.chatInput.value = '';

        // Add the user's message to the chat
        this.addMessage('user', message);

        try {
            // Make a POST request to the server with the user's message and dataset filename
            const response = await fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    query: message, // User's message
                    filename: window.currentDataset // Dataset filename from the global variable
                })
            });

            // Parse the server's response
            const data = await response.json();
            if (data.success) {
                // Add the assistant's response to the chat if successful
                this.addMessage('assistant', data.response);
            } else {
                // Show an error message if the response indicates failure
                this.addMessage('assistant', 'Sorry, I encountered an error processing your request.');
            }
        } catch (error) {
            // Log the error and show an error message in the chat
            console.error('Chat error:', error);
            this.addMessage('assistant', 'Sorry, there was an error processing your message.');
        }
    }

    // Add a new message to the chat UI
    addMessage(role, content) {
        const messageNode = this.messageTemplate.content.cloneNode(true); // Clone the message template
        const messageDiv = messageNode.querySelector('.message'); // Container for the message
        const messageContent = messageNode.querySelector('.message-content'); // Content of the message
        const messageIcon = messageNode.querySelector('.message-icon'); // Icon for the message sender
        const messageTime = messageNode.querySelector('.message-time'); // Timestamp for the message

        // Style the message differently based on the role (user or assistant)
        if (role === 'user') {
            messageDiv.classList.add('justify-end'); // Align the message to the right
            messageContent.classList.add('bg-blue-100'); // Apply user-specific styling
            messageIcon.textContent = 'U'; // Set the icon to 'U' for user
        } else {
            messageContent.classList.add('bg-gray-100'); // Apply assistant-specific styling
            messageIcon.textContent = 'AI'; // Set the icon to 'AI' for assistant
        }

        // Set the message content and timestamp
        messageContent.textContent = content; // Add the actual message content
        messageTime.textContent = new Date().toLocaleTimeString(); // Add the current time as a timestamp

        // Append the message to the chat container
        this.messagesContainer.appendChild(messageNode);

        // Automatically scroll to the bottom of the chat
        this.scrollToBottom();
    }

    // Ensure the chat container is scrolled to the latest message
    scrollToBottom() {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    // Display initial insights or system messages in the chat
    displayInitialInsights(insights) {
        this.addMessage('assistant', insights); // Add the insights as an assistant message
    }
}

// Initialize the ChatInterface class when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    window.chatInterface = new ChatInterface(); // Create a global instance of the chat interface
});
