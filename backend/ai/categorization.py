"""
AI-powered Auto-Categorization and Skill Tagging
Uses multi-label text classification on resource titles and metadata
"""
from google import genai
from google.genai import types
import os
from typing import Dict, List


class AutoCategorizer:
    """
    Automatically categorizes resources and assigns skill tags
    """
    
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY environment variable not set")
        
        self.client = genai.Client(api_key=api_key)
    
    async def categorize_resource(
        self,
        resource_name: str,
        description: str = None,
        resource_type: str = None,
        platform: str = None
    ) -> Dict:
        """
        Automatically categorize and tag a resource
        
        Returns:
            {
                "category": "Frontend Development",
                "subcategory": "React",
                "skill_tags": ["React Hooks", "State Management", "Component Design"],
                "difficulty_level": "Intermediate",
                "related_skills": ["JavaScript", "HTML", "CSS"]
            }
        """
        
        prompt = f"""
You are an expert learning content classifier analyzing educational resources.

Resource Information:
- Name: {resource_name}
- Description: {description or "Not provided"}
- Type: {resource_type or "Not specified"}
- Platform: {platform or "Not specified"}

Task: Classify this resource and provide:
1. Primary category (e.g., "Frontend Development", "Data Science", "Backend Development", "DevOps", "Mobile Development", "Soft Skills", "Cloud Computing", "Machine Learning", etc.)
2. Specific subcategory (e.g., "React", "Python", "SQL", "Docker", etc.)
3. Relevant skill tags (5-8 specific technical skills, e.g., "React Hooks", "RESTful APIs", "Object-Oriented Programming")
4. Estimated difficulty level (Beginner, Intermediate, Advanced, Expert)
5. Related prerequisite skills (3-5 skills that would help)

Return ONLY a JSON object:
{{
  "category": "main category",
  "subcategory": "specific subcategory",
  "skill_tags": ["tag1", "tag2", "tag3"],
  "difficulty_level": "Intermediate",
  "related_skills": ["skill1", "skill2", "skill3"]
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
            print(f"Error categorizing resource: {str(e)}")
            return {
                "category": "Uncategorized",
                "subcategory": "",
                "skill_tags": [],
                "difficulty_level": "Unknown",
                "related_skills": [],
                "error": str(e)
            }


# Singleton instance
_auto_categorizer = None

def get_auto_categorizer() -> AutoCategorizer:
    global _auto_categorizer
    if _auto_categorizer is None:
        _auto_categorizer = AutoCategorizer()
    return _auto_categorizer
