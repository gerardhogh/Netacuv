import sys
import os
from google import genai

client = genai.Client()
# We will use the file path passed as argument
image_path = sys.argv[1]

# Upload to Gemini and extract text
try:
    print(f"Reading {image_path}...")
    sample_file = client.files.upload(file=image_path)
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=['Extract all text from this image and describe what error is shown. If it is a web browser, what is the URL?', sample_file]
    )
    print(response.text)
except Exception as e:
    print(f"Error: {e}")

