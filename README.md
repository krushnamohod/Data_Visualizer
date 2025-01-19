# 🌟 Visualization Dashboard 🌟  

Welcome to the **Visualization Dashboard**! This project provides an intuitive and professional platform for uploading datasets, performing data visualizations, conducting statistical analysis, and leveraging AI-powered insights.  

---

## 🚀 **Features**  

1. **Upload Datasets:**  
   - Drag-and-drop functionality for datasets up to **100 MB**.  

2. **Data Visualization:**  
   - Generate visualizations such as histograms, line plots, correlation matrices, and more.  

3. **Statistical Analysis:**  
   - Perform calculations like mean, median, mode, and other insights directly on the dashboard.  

4. **AI-Powered Assistance:**  
   - Integrated with Google Gemini AI for dataset insights and real-time explanations.  

---

## 🛠️ **Installation Instructions**  

### Clone the Repository  
Clone this repository to your local machine:  
```bash  
git clone https://github.com/krushnamohod/Data_Visualizer.git  
cd visualization-dashboard
```
### Create virtual environment 
paste in your command line
```bash
python -m venv venv  
source venv/bin/activate  # On Linux/Mac  
venv\Scripts\activate     # On Windows  
```
### Install Dependencies
paste in your command line 
```bash
pip install -r requirements.txt  
```

### Generate API Key
Follow this link to generate a Google Gemini API key:
**[Google AI Studio - Generate API Key](https://aistudio.google.com/prompts/new_chat)** 

###  Configure the .env File
After generating the API key
Add your API key to the .env file in the root of the project directory:
```bash
GOOGLE_API_KEY="YOUR_API_KEY" 
```
---
## 📁 File Structure
```markdown
visualization-dashboard/  
├── datasets/  
├── static/  
│   ├── js/  
│   │   ├── chat.js  
│   │   ├── dashboard.js  
│   │   └── main.js  
│   ├── styles/  
│   │   ├── main.css  
│   │   └── styles.css  
├── templates/  
│   ├── dashboard.html  
│   └── landing.html  
├── uploads/  
│   └── food_impact_india_1.csv  
├── app.py  
├── chatsection.py  
├── statisticsanalysis.py  
├── visualize.py  
├── .env  
├── .gitignore  
├── requirements.txt  
├── README.md  
```
---
## ⚙️ How to Run the Project
1. Activate your Virtual environment
```bash
source venv/bin/activate  # On Linux/Mac  
venv\Scripts\activate     # On Windows  
```
2. Start the Flask server:
```bash
python app.py  
```
3. Open your browser and navigate to:
```arduino
http://127.0.0.1:5000  
```
or your machine IP address appearing on your command line 

---
## 📝 Notes
Make sure your <span style="background-color: grey">.env</span> file contains the correct API key for the AI integration.
For any additional dependencies or updates, modify the requirements.txt file and reinstall using <span style="background-color: grey">pip install -r requirements.txt</span>

---
## 🛠️ Technology Stack
Backend: Flask
Frontend: HTML, CSS, JavaScript

---
## 👨‍💻 Contributors
This project is developed by Cognitive Developers.

Feel free to star 🌟 this repository and provide feedback or suggestions!

```vbnet

Let me know if there’s anything else you’d like to change! 🚀
```   
---
