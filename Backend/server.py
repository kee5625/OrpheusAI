from flask import Flask, request, jsonify, render_template, send_from_directory
from werkzeug.utils import secure_filename
import os
import cv2
import numpy as np
from tensorflow import keras
from keras.preprocessing import image

from flask_cors import CORS

import fitz #PyMuPDF (analysis)
from collections import Counter
import re

def extract_text_from_pdf(pdf_path):
    text = ""
    with fitz.open(pdf_path) as doc:
        for page in doc:
            text += page.get_text()
    return text

def simple_summary(text, top_n=5):
    # Tokenize and clean
    words = re.findall(r'\b\w+\b', text.lower())
    stopwords = set([
        'the', 'and', 'of', 'to', 'a', 'in', 'for', 'on', 'is', 'with',
        'that', 'as', 'by', 'an', 'this', 'from', 'be', 'at', 'are'
    ])
    keywords = [word for word in words if word not in stopwords]
    
    # Frequency count
    most_common = Counter(keywords).most_common(top_n)
    summary = "Key Terms: " + ", ".join([word for word, _ in most_common])
    return summary

app = Flask(__name__, static_folder='../Frontend', static_url_path='')

CORS(app)

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'bmp'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Load the trained model
model = keras.models.load_model('Backend/v2.keras')

# Class names
CLASS_NAMES = [
    "1. Acne Vulgaris",
    "2. Basal Cell Carcinoma",
    "3. Dermatofibroma",
    "4. Eczema",
    "5. Lichen Planus",
    "6. Melanoma",
    "7. Psoriasis",
    "8. Seborrhoeic dermatitis",
    "9. Squamous Cell Carcinoma",
    "10. Vitiligo"
]

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def preprocess_image(img_path):
    img = cv2.imread(img_path)
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)  # Convert to RGB
    img = cv2.resize(img, (256, 256))
    img = img / 255.0  # Normalize
    img = np.expand_dims(img, axis=0)  # Add batch dimension
    return img

@app.route('/')
def serve_index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400
        
    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'No image selected'}), 400
        
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        upload_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(upload_path)
        
        try:
            # Preprocess and predict
            processed_img = preprocess_image(upload_path)
            predictions = model.predict(processed_img)
            
            # Get indices of top 3 probabilities, in descending order
            top3_indices = predictions[0].argsort()[-3:][::-1]
            
            top3 = []
            for idx in top3_indices:
                top3.append({
                    "class": CLASS_NAMES[idx],
                    "confidence": float(predictions[0][idx])
                })
            
            '''
            for pred in top3:
                if pred["class"] == "2. Basal Cell Carcinoma":
                    pred["class"] = "Basal Cell Carcinoma or Melanoma"
            # Clean up uploaded file
            '''
            os.remove(upload_path)
            
            return jsonify({"top3": top3})
        
        except Exception as e:
            return jsonify({'error': str(e)}), 500
            
    return jsonify({'error': 'File type not allowed'}), 400

@app.route('/analyze_pdf', methods=['POST'])
def analyze_pdf():
    if 'pdf' not in request.files:
        return jsonify({'error': 'No PDF uploaded'}), 400
    
    file = request.files['pdf']
    if file.filename == '' or not file.filename.lower().endswith('.pdf'):
        return jsonify({'error': 'Invalid file type. Only PDFs allowed.'}), 400
    
    filename = secure_filename(file.filename)
    upload_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(upload_path)
    
    try:
        # Step 1: Extract raw text
        text = extract_text_from_pdf(upload_path)

        # Step 2: Generate a simple summary (keyword-based)
        summary = simple_summary(text)

        # Optional: Extract some example keywords
        keywords = summary.replace("Key Terms: ", "").split(", ")

        # Clean up file
        os.remove(upload_path)

        return jsonify({
            "summary": summary,
            "keywords": keywords
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Create upload folder if it doesn't exist
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)
    app.run(debug=True)