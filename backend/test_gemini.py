import os
from dotenv import load_dotenv
from google import genai
from google.genai import types

# Load environment variables
load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
print(f"API Key found: {'Yes' if api_key else 'No'}")
if api_key:
    print(f"API Key length: {len(api_key)}")
    print(f"API Key starts with: {api_key[:5]}...")

if not api_key or api_key == "your_gemini_api_key_here":
    print("❌ ERROR: Invalid API key configuration. Please update .env file.")
    exit(1)

try:
    print("\nTesting Gemini API connection...")
    client = genai.Client(api_key=api_key)
    
    response = client.models.generate_content(
        model='gemini-2.0-flash',
        contents='Hello, are you working?',
        config=types.GenerateContentConfig(
            max_output_tokens=50
        )
    )
    print(f"✅ Success! Response: {response.text}")
    
except Exception as e:
    print(f"❌ API Error: {str(e)}")
