import json
import sys
import numpy as np
import re
import pandas as pd
import tensorflow as tf
import nltk
import concurrent.futures

nltk.download('punkt')
nltk.download('stopwords')

from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords

# Load Models
model_lstm = tf.keras.models.load_model("../ML/models/BiLSTM.keras")
model_dense = tf.keras.models.load_model("../ML/models/NNDense.keras")
model_lstm_att = tf.keras.models.load_model("../ML/models/BiLSTMAtt.keras")

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

glove_path = "../ML/encoder/glove.6B.300d.txt"
word_embeddings = load_glove_embeddings(glove_path)

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
        return np.mean(matrix, axis=0)
    return np.zeros((dimensions,))

# Predict with model
def predict_with_model(model, embeddings):
    return model.predict(embeddings)

# Read input from Node.js
def main():
    try:
        input_data = json.loads(sys.stdin.read())
        print(input_data)
        if "career_objective" not in input_data or "skills" not in input_data:
            print(json.dumps({"error": "Invalid input"}))
            return

        text = preprocess_text(input_data["career_objective"] + " " + input_data["skills"])
        embeddings = sentence_to_glove(text, word_embeddings).reshape(1, 300)

        # lstm_pred = model_lstm.predict(embeddings.reshape(1, 1, 300))
        # dense_pred = model_dense.predict(embeddings.reshape(1, 300))
        # lstm_att_pred = model_lstm_att.predict(embeddings.reshape(1, 1, 300))

        with concurrent.futures.ThreadPoolExecutor() as executor:
            future_lstm = executor.submit(predict_with_model, model_lstm, embeddings.reshape(1, 1, 300))
            future_dense = executor.submit(predict_with_model, model_dense, embeddings.reshape(1, 300))
            future_lstm_att = executor.submit(predict_with_model, model_lstm_att, embeddings.reshape(1, 1, 300))

            lstm_pred = future_lstm.result()
            dense_pred = future_dense.result()
            lstm_att_pred = future_lstm_att.result()

        # Compute average across all models
        avg_prediction = (lstm_pred + dense_pred + lstm_att_pred) / 3
        positions = ['Data Analyst', 'Data Engineer', 'Data Scientist', 'Machine Learning Engineer', 'SDE', 'Software Developer', 'SWE']
        
        result = {positions[i]: float(avg_prediction[0][i]) for i in range(len(positions))}
        top_roles = sorted(result, key=result.get, reverse=True)[:2]
        print(json.dumps({"predictions": result,"roles": top_roles}))

    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    main()
