import numpy as np
import pandas as pd
import tensorflow as tf
import os

os.system('cls')

# Load the trained model
name = input("Enter Model Path along With Name: ")
model = tf.keras.models.load_model(name)

# Load the user input data
file_path = "prompts.csv"
dataframe = pd.read_csv(file_path)

# Function to load word embeddings
def load_encoder(file):
    embeddings = {}
    with open(file, 'r', encoding="utf-8") as f:
        for line in f:
            values = line.split()
            word = values[0]
            vector = np.asarray(values[1:], dtype='float32')
            embeddings[word] = vector
    return embeddings

# Function to generate sentence embeddings
def sentence_embeddings(sentence, embeddings, dimensions=300):
    words = sentence.split()
    matrix = [embeddings[word] for word in words if word in embeddings]
    if matrix:
        return np.mean(matrix, axis=0)
    return np.zeros((dimensions,))

# Load embeddings
encoder_path = input("Enter path of the encoder: ")
print("\nLoading encoder... This may take some time.\n")
encoder = load_encoder(encoder_path)

# Encode Objective and Skillset
df = pd.read_csv(file_path)
info = np.array([sentence_embeddings(text, encoder, 300) for text in df['Description']])
final_df_glove = pd.DataFrame(info)

print(df['Description'])

# Position labels
position_labels = ['Data Analyst', 'Data Engineer', 'Data scientist', 'Machine Learning Engineer', 'SDE', 'Software Developer', 'SWE']

# Predict sentiment
for idx, (desc) in enumerate(zip(df['Description'])):
    print(f"\nEntry #{idx + 1}: -\n")
    probability = model.predict(final_df_glove[idx:idx+1])
    probability = np.round(probability, 5) * 100

    print("\nThe Probability of matching each position: -\n")
    
    for i, label in enumerate(position_labels):
        print(f"{label}: {probability[0][i]}%")
    
    best_match_idx = np.argmax(probability)
    best_match = position_labels[best_match_idx]
    print(f"\nThe best-matching position is: {best_match}\n")
