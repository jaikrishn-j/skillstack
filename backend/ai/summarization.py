"""
AI-powered Note Summarization and Key Concept Extraction
Uses NLP for abstractive summarization and extractive key concepts
"""
from google import genai
from google.genai import types
import os
from typing import Dict, List


class NoteSummarizer:
    """
    Processes user notes and generates summaries with key concepts
    """
    
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY environment variable not set")
        
        self.client = genai.Client(api_key=api_key)
    
    async def summarize_notes(
        self, 
        notes: str,
        resource_name: str,
        resource_type: str = None
    ) -> Dict:
        """
        Generate summary and extract key concepts from user notes
        
        Returns:
            {
                "summary": "concise summary",
                "key_concepts": ["concept1", "concept2", ...],
                "technical_terms": {"term": "definition", ...},
                "main_topics": ["topic1", "topic2", ...]
            }
        """
        
        if not notes or len(notes.strip()) < 20:
            return {
                "summary": "",
                "key_concepts": [],
                "technical_terms": {},
                "main_topics": []
            }
        
        prompt = f"""
You are an expert technical learning assistant analyzing student notes.

Resource: {resource_name}
Type: {resource_type or "Unknown"}

Student's Notes:
{notes}

Task: Analyze these notes and provide:
1. A concise 2-3 sentence summary capturing the main learning points
2. A list of key technical concepts mentioned (5-10 items)
3. Important technical terms with brief definitions (as a dictionary)
4. Main topics covered (3-5 broad categories)

Return ONLY a JSON object in this exact format:
{{
  "summary": "2-3 sentence summary here",
  "key_concepts": ["concept1", "concept2", "concept3"],
  "technical_terms": {{
    "term1": "brief definition",
    "term2": "brief definition"
  }},
  "main_topics": ["topic1", "topic2", "topic3"]
}}
"""
        
        try:
            response = self.client.models.generate_content(
                model='gemini-3-pro-preview',
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json"
                )
            )
            
            import json
            result = json.loads(response.text)
            return result
            
        except Exception as e:
            print(f"Error summarizing notes: {str(e)}")
            return {
                "summary": "",
                "key_concepts": [],
                "technical_terms": {},
                "main_topics": [],
                "error": str(e)
            }


# Singleton instance
_note_summarizer = None

def get_note_summarizer() -> NoteSummarizer:
    global _note_summarizer
    if _note_summarizer is None:
        _note_summarizer = NoteSummarizer()
    return _note_summarizer
