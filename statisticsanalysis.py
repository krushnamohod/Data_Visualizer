# statistics.py
import pandas as pd
import numpy as np
from scipy import stats

class DataAnalyzer:
    def __init__(self, df):
        self.df = df
        self.numeric_columns = df.select_dtypes(include=['float64', 'int64']).columns
        self.categorical_columns = df.select_dtypes(include=['object']).columns

    def get_basic_stats(self, column=None):
        """Get basic statistical measures for a column or all numeric columns"""
        if column:
            if column in self.numeric_columns:
                return {
                    'mean': self.df[column].mean(),
                    'median': self.df[column].median(),
                    'std': self.df[column].std(),
                    'min': self.df[column].min(),
                    'max': self.df[column].max(),
                    'skewness': stats.skew(self.df[column].dropna()),
                    'kurtosis': stats.kurtosis(self.df[column].dropna())
                }
            else:
                return {
                    'unique_values': self.df[column].nunique(),
                    'mode': self.df[column].mode()[0],
                    'value_counts': self.df[column].value_counts().to_dict()
                }
        else:
            return self.df[self.numeric_columns].describe()

    def check_normality(self, column):
        """Perform Shapiro-Wilk test for normality"""
        if column in self.numeric_columns:
            statistic, p_value = stats.shapiro(self.df[column].dropna())
            return {
                'test': 'Shapiro-Wilk',
                'statistic': statistic,
                'p_value': p_value,
                'is_normal': p_value > 0.05
            }
        return None

    def correlation_analysis(self, method='pearson'):
        """Calculate correlation matrix with specified method"""
        numeric_df = self.df[self.numeric_columns]
        return numeric_df.corr(method=method)

    def get_outliers(self, column, method='zscore'):
        """Detect outliers using specified method"""
        if column not in self.numeric_columns:
            return None

        if method == 'zscore':
            z_scores = np.abs(stats.zscore(self.df[column].dropna()))
            outliers = self.df[column][z_scores > 3]
        elif method == 'iqr':
            Q1 = self.df[column].quantile(0.25)
            Q3 = self.df[column].quantile(0.75)
            IQR = Q3 - Q1
            outliers = self.df[column][(self.df[column] < (Q1 - 1.5 * IQR)) | 
                                     (self.df[column] > (Q3 + 1.5 * IQR))]
        return {
            'outliers': outliers.to_dict(),
            'count': len(outliers)
        }

    def missing_values_analysis(self):
        """Analyze missing values in the dataset"""
        missing = self.df.isnull().sum()
        missing_pct = (missing / len(self.df)) * 100
        return {
            'missing_count': missing.to_dict(),
            'missing_percentage': missing_pct.to_dict()
        }