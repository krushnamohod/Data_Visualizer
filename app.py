from flask import Flask, request, jsonify, render_template
from werkzeug.utils import secure_filename
import pandas as pd
import os
from visualize import DataVisualizer
from chatsection import DataChatBot
from statisticsanalysis import DataAnalyzer

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 200 * 1024 * 1024  # 100MB max file size
app.config['UPLOAD_FOLDER'] = 'uploads'

# Initialize chatbot
chatbot = DataChatBot()

@app.route('/')
def index():
    return render_template('landing.html')

@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if file and file.filename.endswith('.csv'):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        # Read dataset
        df = pd.read_csv(filepath)

        # Initialize analyzers
        visualizer = DataVisualizer(df)
        analyzer = DataAnalyzer(df)
        chatbot.set_dataset_info(df)

        # Get initial insights and available plots
        insights = chatbot.generate_initial_insights()
        available_plots = visualizer.get_available_plots()
        basic_stats = analyzer.get_basic_stats()

        return jsonify({
            'success': True,
            'insights': insights,
            'available_plots': available_plots,
            'basic_stats': basic_stats.to_dict(),
            'missing_values': analyzer.missing_values_analysis()
        })

    return jsonify({'error': 'Only CSV files are allowed'}), 400

@app.route('/visualize', methods=['POST'])
def create_visualization():
    data = request.json
    plot_type = data['plot_type']
    params = data.get('params', {})

    # Load the most recent dataset from the upload folder
    uploaded_files = os.listdir(app.config['UPLOAD_FOLDER'])
    if not uploaded_files:
        return jsonify({'error': 'No dataset available for visualization'}), 400

    latest_file = max(
        [os.path.join(app.config['UPLOAD_FOLDER'], f) for f in uploaded_files],
        key=os.path.getctime
    )

    df = pd.read_csv(latest_file)
    visualizer = DataVisualizer(df)

    plot_functions = {
        'histogram': visualizer.create_histogram,
        'boxplot': visualizer.create_boxplot,
        'scatter': visualizer.create_scatter,
        'correlation': visualizer.create_correlation_heatmap,
        'bar': visualizer.create_bar_plot,
        'line': visualizer.create_line_plot,
        'pie': visualizer.create_pie_chart,
        'violin': visualizer.create_violin,
        'QQ': visualizer.create_QQ
    }

    if plot_type not in plot_functions:
        return jsonify({'error': 'Invalid plot type'}), 400

    try:
        plot_base64 = plot_functions[plot_type](**params)
        return jsonify({'success': True, 'plot': plot_base64})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/stats', methods=['POST'])
def get_statistics():
    data = request.json
    column = data.get('column')
    stat_type = data.get('stat_type', 'basic')

    # Load the most recent dataset from the upload folder
    uploaded_files = os.listdir(app.config['UPLOAD_FOLDER'])
    if not uploaded_files:
        return jsonify({'error': 'No dataset available for analysis'}), 400

    latest_file = max(
        [os.path.join(app.config['UPLOAD_FOLDER'], f) for f in uploaded_files],
        key=os.path.getctime
    )

    df = pd.read_csv(latest_file)
    analyzer = DataAnalyzer(df)

    if stat_type == 'basic':
        stats = analyzer.get_basic_stats(column)
    elif stat_type == 'normality':
        stats = analyzer.check_normality(column)
    elif stat_type == 'correlation':
        stats = analyzer.correlation_analysis()
    elif stat_type == 'outliers':
        stats = analyzer.get_outliers(column)
    else:
        return jsonify({'error': 'Invalid statistics type'}), 400

    return jsonify({'success': True, 'statistics': stats})

@app.route('/chat', methods=['POST'])
def chat_query():
    data = request.json
    query = data['query']

    # Load the most recent dataset from the upload folder
    uploaded_files = os.listdir(app.config['UPLOAD_FOLDER'])
    if not uploaded_files:
        return jsonify({'error': 'No dataset available for chat analysis'}), 400

    latest_file = max(
        [os.path.join(app.config['UPLOAD_FOLDER'], f) for f in uploaded_files],
        key=os.path.getctime
    )

    df = pd.read_csv(latest_file)
    analyzer = DataAnalyzer(df)
    df_summary = analyzer.get_basic_stats().to_string()

    response = chatbot.process_query(query, df_summary)
    return jsonify({'success': True, 'response': response})

if __name__ == '__main__':
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    app.run(debug=True, host="0.0.0.0", threaded=True)