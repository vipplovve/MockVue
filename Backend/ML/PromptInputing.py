import pandas as pd
import re
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize

# Ensure necessary NLTK resources are available
nltk.download('punkt')
nltk.download('stopwords')

def preprocess_text(text):
    # Convert to lowercase
    text = text.lower()
    # Remove special characters and numbers
    text = re.sub(r'[^a-zA-Z\s]', '', text)
    # Tokenize
    words = word_tokenize(text)
    # Remove stopwords
    filtered_words = [word for word in words if word not in stopwords.words('english')]
    return ' '.join(filtered_words)

# Prompt user for inputs
objective = input("Enter your career objective: ")
skills = input("Enter your skillset (comma-separated): ")

# Preprocess inputs
cleaned_objective = preprocess_text(objective)
cleaned_skills = preprocess_text(skills)

# Combine Objective and Skillset into one column called Description
description = f"{cleaned_objective} {cleaned_skills}".strip()

# Save to CSV file
data = pd.DataFrame({"Description": [description]})
data.to_csv("prompts.csv", index=False)

print("\nPreprocessed data saved to 'prompts.csv'.")
