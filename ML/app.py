from flask import Flask, request, jsonify
import numpy as np
import re
import pandas as pd
import tensorflow as tf
import nltk

# Download necessary NLTK resources
nltk.download('punkt')
nltk.download('stopwords')

from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords

# Load Models
model_lstm = tf.keras.models.load_model("./models/BiLSTM.keras")
model_dense = tf.keras.models.load_model("./models/NNDense.keras")

# Load GloVe Embeddings
def load_glove_embeddings(filepath):
    embeddings = {}
    with open(filepath, 'r', encoding="utf-8") as f:
        for line in f:
            values = line.split()
            word = values[0]
            vector = np.asarray(values[1:], dtype='float32')
            embeddings[word] = vector
    return embeddings

# Load embeddings once when the API starts
glove_path = "./embeddings/glove.6B.300d.txt"
print("Loading GloVe embeddings... (this may take a while)")
word_embeddings = load_glove_embeddings(glove_path)
print("GloVe embeddings loaded successfully!")

# Flask App
app = Flask(__name__)

# Preprocessing Function
def preprocess_text(text):
    text = text.lower()
    text = re.sub(r'[^a-zA-Z\s]', '', text)
    words = word_tokenize(text)
    words = [word for word in words if word not in stopwords.words('english')]
    return ' '.join(words)

# Convert text into GloVe vector
def sentence_to_glove(sentence, embeddings_dict, dimensions=300):
    words = sentence.split()
    matrix = [embeddings_dict[word] for word in words if word in embeddings_dict]
    if matrix:
        return np.mean(matrix, axis=0)  # Average word vectors
    return np.zeros((dimensions,))  # Return zero vector if no words match

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    if "career_objective" not in data or "skills" not in data:
        return jsonify({"error": "Invalid input"}), 400

    # Preprocess input
    text = preprocess_text(data["career_objective"] + " " + data["skills"])
    df = pd.DataFrame({"Description": [text]})

    # Convert text to GloVe embeddings
    embeddings = sentence_to_glove(text, word_embeddings).reshape(1, 300)

    # Get predictions with error handling
    try:
        lstm_pred = model_lstm.predict(embeddings.reshape(1, 1, 300))
    except Exception as e:
        print("Error in LSTM Model:", str(e))
        lstm_pred = np.zeros((1, 7))

    try:
        dense_pred = model_dense.predict(embeddings.reshape(1, 300))
    except Exception as e:
        print("Error in Dense Model:", str(e))
        dense_pred = np.zeros((1, 7))

    # Compute average
    avg_prediction = (lstm_pred + dense_pred) / 2
    positions = ['Data Analyst', 'Data Engineer', 'Data Scientist', 'Machine Learning Engineer', 'SDE', 'Software Developer', 'SWE']
    
    result = {positions[i]: float(avg_prediction[0][i]) for i in range(len(positions))}
    return jsonify({"predictions": result})

if __name__ == '__main__':
    app.run(debug=True)
