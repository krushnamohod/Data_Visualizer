# visualize.py
import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd
import io
import base64

class DataVisualizer:
    def __init__(self, df):
        self.df = df
        if 'seaborn' in plt.style.available:
            plt.style.use('seaborn')
        else:
            print("Warning: 'seaborn' style is not available. Using default style.")

    def get_plot_as_base64(self, fig):
        """Convert matplotlib figure to base64 string"""
        buf = io.BytesIO()
        fig.savefig(buf, format='png', bbox_inches='tight')
        buf.seek(0)
        img_base64 = base64.b64encode(buf.getvalue()).decode('utf-8')
        plt.close(fig)
        return img_base64

    def create_histogram(self, column, bins=30):
        """Create histogram for numerical data"""
        fig, ax = plt.subplots(figsize=(10, 6))
        sns.histplot(data=self.df, x=column, bins=bins, ax=ax)
        ax.set_title(f'Histogram of {column}')
        return self.get_plot_as_base64(fig)

    def create_boxplot(self, column):
        """Create boxplot for numerical data"""
        fig, ax = plt.subplots(figsize=(10, 6))
        sns.boxplot(data=self.df, y=column, ax=ax)
        ax.set_title(f'Boxplot of {column}')
        return self.get_plot_as_base64(fig)

    def create_scatter(self, x_column, y_column):
        """Create scatter plot between two numerical columns"""
        fig, ax = plt.subplots(figsize=(10, 6))
        sns.scatterplot(data=self.df, x=x_column, y=y_column, ax=ax)
        ax.set_title(f'Scatter Plot: {x_column} vs {y_column}')
        return self.get_plot_as_base64(fig)

    def create_correlation_heatmap(self):
        """Create correlation heatmap for numerical columns"""
        numeric_df = self.df.select_dtypes(include=['float64', 'int64'])
        corr_matrix = numeric_df.corr()
        fig, ax = plt.subplots(figsize=(12, 8))
        sns.heatmap(corr_matrix, annot=True, cmap='coolwarm', center=0, ax=ax)
        ax.set_title('Correlation Heatmap')
        return self.get_plot_as_base64(fig)

    def create_bar_plot(self, column, top_n=10):
        """Create bar plot for categorical data"""
        value_counts = self.df[column].value_counts().head(top_n)
        fig, ax = plt.subplots(figsize=(12, 6))
        sns.barplot(x=value_counts.index, y=value_counts.values, ax=ax)
        ax.set_xticklabels(ax.get_xticklabels(), rotation=45, ha='right')
        ax.set_title(f'Top {top_n} Categories in {column}')
        return self.get_plot_as_base64(fig)

    def create_line_plot(self, x_column, y_column):
        """Create line plot (useful for time series)"""
        fig, ax = plt.subplots(figsize=(12, 6))
        sns.lineplot(data=self.df, x=x_column, y=y_column, ax=ax)
        ax.set_xticklabels(ax.get_xticklabels(), rotation=45, ha='right')
        ax.set_title(f'Line Plot: {y_column} over {x_column}')
        return self.get_plot_as_base64(fig)

    def create_pie_chart(self, column):
        """Create pie chart for categorical data"""
        value_counts = self.df[column].value_counts()
        fig, ax = plt.subplots(figsize=(6, 6))
        plt.pie(value_counts.values, labels=value_counts.index, autopct='%1.1f%%')
        ax.set_title(f'Pie Chart of {column}')
        return self.get_plot_as_base64(fig)
    
    def create_violin(self, column):
        """Create violin plot for numerical data"""
        fig, ax = plt.subplots(figsize=(10, 6))
        sns.violinplot(data=self.df, y=column, ax=ax)
        ax.set_title(f'Violin Plot of {column}')
        return self.get_plot_as_base64(fig)
    
    def create_QQ(self, column):
        """Create QQ plot for numerical data"""
        fig, ax = plt.subplots(figsize=(10, 6))
        sns.qqplot(self.df[column], line='45', ax=ax)
        ax.set_title(f'QQ Plot of {column}')
        return self.get_plot_as_base64(fig)
    
    def get_available_plots(self):
        """Return available plot types based on data types"""
        numeric_columns = self.df.select_dtypes(include=['float64', 'int64']).columns
        categorical_columns = self.df.select_dtypes(include=['object']).columns
        
        available_plots = {
            'histogram': list(numeric_columns),
            'boxplot': list(numeric_columns),
            'scatter': list(numeric_columns),
            'bar': list(categorical_columns),
            'line': list(numeric_columns),
            'pie': list(categorical_columns),
            'violin': list(numeric_columns),
            'QQ': list(numeric_columns),
            'correlation': 'Available' if len(numeric_columns) > 1 else 'Not Available'
        }
        return available_plots