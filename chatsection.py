from dotenv import load_dotenv
import os
import google.generativeai as genai
from datetime import datetime

# Load environment variables
load_dotenv()

class DataChatBot:
    def __init__(self):
        api_key = os.getenv('GOOGLE_API_KEY')
        if not api_key:
            raise ValueError("Google API key not found in environment variables")
        
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-pro')
        self.dataset_info = None
        self.chat_history = []

    def set_dataset_info(self, df):
        """Store dataset information for context"""
        self.dataset_info = {
            'shape': df.shape,
            'columns': list(df.columns),
            'dtypes': df.dtypes.to_dict(),
            'numeric_columns': list(df.select_dtypes(include=['float64', 'int64']).columns),
            'categorical_columns': list(df.select_dtypes(include=['object']).columns),
            'sample_data': df.head(5).to_dict()
        }

    def get_chat_history(self):
        """Return the chat history"""
        return self.chat_history

    def _add_to_history(self, role, content):
        """Add message to chat history with timestamp"""
        self.chat_history.append({
            'role': role,
            'content': content,
            'timestamp': datetime.now().isoformat()
        })

    def generate_initial_insights(self):
        """Generate initial insights about the dataset"""
        if not self.dataset_info:
            return "No dataset information available."

        prompt = f"""As a data analysis assistant, provide a concise initial analysis of this dataset:
        
        Dataset Overview:
        - Rows: {self.dataset_info['shape'][0]}
        - Columns: {self.dataset_info['shape'][1]}
        
        Column Types:
        - Numeric columns: {', '.join(self.dataset_info['numeric_columns'])}
        - Categorical columns: {', '.join(self.dataset_info['categorical_columns'])}
        
        Please provide:
        1. A brief overview of what this dataset appears to contain
        2. Key columns that might be interesting for analysis
        3. Suggested visualizations that might be insightful
        """

        response = self.model.generate_content(prompt)
        insight = response.text
        
        # Add to chat history
        self._add_to_history('assistant', 'Initial Dataset Analysis:\n' + insight)
        return insight

    def process_query(self, query):
        """Process user query about the data"""
        if not self.dataset_info:
            return "Please upload a dataset first."

        # Add user query to history
        self._add_to_history('user', query)

        # Prepare context for the AI
        context = f"""You are a data analysis assistant helping with a dataset that has the following structure:
        
        Dataset Info:
        - Dimensions: {self.dataset_info['shape']}
        - Available numeric columns: {', '.join(self.dataset_info['numeric_columns'])}
        - Available categorical columns: {', '.join(self.dataset_info['categorical_columns'])}
        
        User Query: {query}
        
        Provide a helpful response that:
        1. Directly addresses the user's question
        2. Suggests relevant visualizations or analyses when applicable
        3. Uses the actual column names from the dataset
        """

        response = self.model.generate_content(context)
        answer = response.text
        
        # Add assistant's response to history
        self._add_to_history('assistant', answer)
        return answer

    def suggest_visualization(self, columns=None):
        """Suggest appropriate visualizations based on selected columns"""
        if not columns:
            columns = self.dataset_info['columns']

        prompt = f"""Given these columns: {columns}
        Suggest appropriate visualization types considering:
        - Column data types
        - Relationships between variables
        - Best practices in data visualization
        
        Provide specific suggestions using the actual column names."""

        response = self.model.generate_content(prompt)
        return response.text