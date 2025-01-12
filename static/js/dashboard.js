// static/js/dashboard.js

class Dashboard {
    constructor() {
        this.initializeEventListeners();
        this.currentDataset = null;
    }

    initializeEventListeners() {
        const fileInput = document.getElementById('file-input');
        const aiSubmit = document.getElementById('ai-submit');
        const aiInput = document.getElementById('ai-input');

        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length) this.handleFileUpload(e.target.files[0]);
        });

        aiSubmit.addEventListener('click', () => this.handleAiQuery());
        aiInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleAiQuery();
        });
    }

    async handleFileUpload(file) {
        if (!file.name.endsWith('.csv')) {
            alert('Please upload a CSV file');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/upload', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                document.getElementById('upload-status').classList.remove('hidden');
                this.currentDataset = data.dataset_info;
                this.showDashboard();
                this.displayAiInsights(data.insights);
            } else {
                alert(data.error);
            }
        } catch (error) {
            console.error('Upload failed:', error);
            alert('File upload failed. Please try again.');
        }
    }

    showDashboard() {
        document.getElementById('upload-section').classList.add('hidden');
        document.getElementById('dashboard-section').classList.remove('hidden');
    }

    displayAiInsights(insights) {
        const aiChat = document.getElementById('ai-chat');
        aiChat.innerHTML = `
            <div class="mb-4">
                <strong>AI:</strong> ${insights}
            </div>
        `;
    }

    async handleAiQuery() {
        const input = document.getElementById('ai-input');
        const query = input.value.trim();
        if (!query) return;

        const aiChat = document.getElementById('ai-chat');
        aiChat.innerHTML += `
            <div class="mb-2">
                <strong>You:</strong> ${query}
            </div>
        `;

        try {
            const response = await fetch('/ai-query', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    query: query,
                    dataset: this.currentDataset.filename
                })
            });

            const data = await response.json();
            aiChat.innerHTML += `
                <div class="mb-4">
                    <strong>AI:</strong> ${data.response}
                </div>
            `;
        } catch (error) {
            console.error('AI query failed:', error);
            alert('Failed to get AI response. Please try again.');
        }

        input.value = '';
        aiChat.scrollTop = aiChat.scrollHeight;
    }

    addVisualization() {
        // Create a modal element
        const modal = document.createElement('div');
        modal.classList.add('modal');
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-button">&times;</span>
                <h2>Select an option</h2>
                <button id="add-visualization-btn">Add Visualization</button>
                <button id="add-statistical-analysis-btn">Add Statistical Analysis</button>
            </div>
        `;

        // Append modal to the body
        document.body.appendChild(modal);

        // Show the modal
        modal.style.display = 'block';

        // Close the modal when the close button is clicked
        modal.querySelector('.close-button').onclick = function() {
            modal.style.display = 'none';
            document.body.removeChild(modal);
        };

        // Add event listeners for the buttons
        document.getElementById('add-visualization-btn').onclick = function() {
            // Implementation for adding visualization
            alert('Add Visualization clicked');
            modal.style.display = 'none';
            document.body.removeChild(modal);
        };

        document.getElementById('add-statistical-analysis-btn').onclick = function() {
            // Implementation for adding statistical analysis
            alert('Add Statistical Analysis clicked');
            modal.style.display = 'none';
            document.body.removeChild(modal);
        };
    }
}

// Initialize dashboard when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new Dashboard();
});