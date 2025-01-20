import os
from dotenv import load_dotenv
import google.generativeai as genai
from datetime import datetime

# Load environment variables from .env file
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
        """
        Store essential information about the dataset for context.
        
        Args:
            df (pd.DataFrame): The dataset to analyze.
        """
        self.dataset_info = {
            'shape': df.shape,  # Dimensions of the dataset (rows, columns)
            'columns': list(df.columns),  # List of column names
            'dtypes': df.dtypes.to_dict(),  # Data types of each column
            'numeric_columns': list(df.select_dtypes(include=['float64', 'int64']).columns),  # Numeric columns
            'categorical_columns': list(df.select_dtypes(include=['object']).columns),  # Categorical columns
            'sample_data': df.head(5).to_dict()  # First 5 rows as a dictionary
        }

    def get_chat_history(self):
        """
        Return the conversation history between the user and the assistant.
        
        Returns:
            list: Chat history with timestamps.
        """
        return self.chat_history

    def _add_to_history(self, role, content):
        """
        Add a message to the chat history with a timestamp.
        
        Args:
            role (str): 'user' or 'assistant', indicating who sent the message.
            content (str): The content of the message.
        """
        self.chat_history.append({
            'role': role,
            'content': content,
            'timestamp': datetime.now().isoformat()
        })

    def generate_initial_insights(self):
        """
        Generate initial insights about the dataset.
        
        Returns:
            str: Insights about the dataset's structure, key columns, and suggested visualizations.
        """
        if not self.dataset_info:
            return "No dataset information available."

        # Construct a prompt with dataset details
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

        # Generate content using the AI model
        response = self.model.generate_content(prompt)
        insight = response.text

        # Add the assistant's response to chat history
        formatted_insight = f"""**1. Brief Overview:**\n{insight}"""  # Apply bold formatting
        self._add_to_history('assistant', 'Initial Dataset Analysis:\n' + formatted_insight)
        return formatted_insight


    def process_query(self, query, df_summary):
        """
        Process a user query related to the dataset and return a response.
        
        Args:
            query (str): The user's question or request.
            df_summary (str): Summary statistics of the dataset
        
        Returns:
            str: AI-generated response to the user's query.
        """
        if not self.dataset_info:
            return "Please upload a dataset first."

        self._add_to_history('user', query)

        context = f"""You are a data analysis assistant. Here is the dataset summary:
        {df_summary}
        
        Dataset Info:
        - Dimensions: {self.dataset_info['shape']}
        - Available numeric columns: {', '.join(self.dataset_info['numeric_columns'])}
        - Available categorical columns: {', '.join(self.dataset_info['categorical_columns'])}
        
        User Query: {query}
        
        Please provide a clear and helpful response that:
        1. Directly addresses the user's question
        2. References specific statistics from the dataset summary when relevant
        3. Suggests relevant visualizations or analyses when applicable
        """

        try:
            response = self.model.generate_content(context)
            answer = response.text
            
            formatted_answer = f"**Response:** {answer}"
            self._add_to_history('assistant', formatted_answer)
            return formatted_answer
        except Exception as e:
            error_msg = f"Error generating response: {str(e)}"
            self._add_to_history('assistant', error_msg)
            return error_msg

    def suggest_visualization(self, columns=None):
        """
        Suggest visualizations based on the selected columns or entire dataset.
        
        Args:
            columns (list, optional): List of columns to consider for visualization. Defaults to all columns.
        
        Returns:
            str: Suggested visualization types and ideas.
        """
        if not columns:
            columns = self.dataset_info['columns']  # Default to all columns if none are specified

        # Construct a prompt to suggest visualizations
        prompt = f"""Given these columns: {columns}
        Suggest appropriate visualization types considering:
        - Column data types
        - Relationships between variables
        - Best practices in data visualization
        
        Provide specific suggestions using the actual column names."""

        # Generate content using the AI model
        response = self.model.generate_content(prompt)
        return response.text
