class Dashboard {
    constructor() {
        this.columns = {
            numeric: [],
            categorical: [],
        };
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
                body: formData,
            });

            const data = await response.json();
            if (data.success) {
                document.getElementById('upload-status').classList.remove('hidden');
                this.currentDataset = data.dataset_info;
                this.columns = {
                    numeric: data.available_plots.histogram || [],
                    categorical: data.available_plots.bar || [],
                };
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
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query }),
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
        const modal = document.createElement('div');
        modal.classList.add(
            'modal',
            'fixed',
            'inset-0',
            'bg-gray-800',
            'bg-opacity-50',
            'flex',
            'items-center',
            'justify-center',
            'z-50'
        );
        modal.innerHTML = `
            <div class="bg-white rounded-lg shadow-lg w-[800px] p-6">
                <span class="close-button text-gray-400 hover:text-gray-600 float-right cursor-pointer">&times;</span>
                <div class="flex space-x-4">
                    <div class="w-1/2">
                        <h2 class="text-lg font-bold mb-4">Create Visualization</h2>
                        <form id="visualization-form" class="space-y-4">
                            <label for="plot-type" class="block font-medium">Select Plot Type</label>
                            <select id="plot-type" class="border rounded-lg w-full px-4 py-2">
                                <option value="">Select a plot type...</option>
                                <option value="histogram">Histogram</option>
                                <option value="scatter">Scatter Plot</option>
                                <option value="boxplot">Boxplot</option>
                                <option value="correlation">Correlation Heatmap</option>
                                <option value="bar">Bar Chart</option>
                                <option value="line">Line Plot</option>
                            </select>
                            <div id="column-select-container" class="hidden"></div>
                            <button type="button" id="create-visualization" class="bg-blue-500 text-white px-4 py-2 rounded-lg w-full hover:bg-blue-600">
                                Generate Visualization
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modal.querySelector('.close-button').onclick = () => document.body.removeChild(modal);

        modal.querySelector('#plot-type').addEventListener('change', (e) =>
            this.updateColumnSelection(e.target.value)
        );

        modal.querySelector('#create-visualization').onclick = async () =>
            this.generateVisualization(modal);
    }

    updateColumnSelection(plotType) {
        const container = document.getElementById('column-select-container');
        container.classList.remove('hidden');
        container.innerHTML = '';

        switch (plotType) {
            case 'histogram':
            case 'boxplot':
                this.addColumnSelect(container, 'column', 'Select Column', this.columns.numeric);
                break;
            case 'scatter':
            case 'line':
                this.addColumnSelect(container, 'x-column', 'Select X-Axis Column', this.columns.numeric);
                this.addColumnSelect(container, 'y-column', 'Select Y-Axis Column', this.columns.numeric);
                break;
            case 'bar':
                this.addColumnSelect(container, 'column', 'Select Column', this.columns.categorical);
                break;
            case 'correlation':
                container.innerHTML = '<p class="text-gray-600">Using all numeric columns</p>';
                break;
        }
    }

    addColumnSelect(container, id, label, options) {
        const div = document.createElement('div');
        div.innerHTML = `
            <label for="${id}" class="block font-medium">${label}</label>
            <select id="${id}" class="border rounded-lg w-full px-4 py-2">
                <option value="">Select a column...</option>
                ${options.map((col) => `<option value="${col}">${col}</option>`).join('')}
            </select>
        `;
        container.appendChild(div);
    }

    async generateVisualization(modal) {
        const plotType = modal.querySelector('#plot-type').value;
        const params = { plot_type: plotType, params: {} };

        if (['histogram', 'boxplot', 'bar'].includes(plotType)) {
            params.params.column = modal.querySelector('#column').value;
        } else if (['scatter', 'line'].includes(plotType)) {
            params.params.x_column = modal.querySelector('#x-column').value;
            params.params.y_column = modal.querySelector('#y-column').value;
        }

        try {
            const response = await fetch('/visualize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(params),
            });

            const data = await response.json();
            if (data.success) {
                const img = document.createElement('img');
                img.src = `data:image/png;base64,${data.plot}`;
                document.getElementById('visualization-container').appendChild(img);
            } else {
                alert(data.error);
            }
        } catch (error) {
            console.error('Visualization generation failed:', error);
            alert('Failed to generate visualization. Please try again.');
        }
    }
}

// Initialize the dashboard when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new Dashboard();
});
