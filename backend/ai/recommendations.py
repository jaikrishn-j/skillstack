"""
AI-powered Resource Recommendation Engine
Uses both collaborative filtering and content-based filtering
"""
from google import genai
from google.genai import types
from typing import List, Dict, Optional
import os
from database.db import get_db, prisma
from database.models import User, Resources


class ResourceRecommendationEngine:
    """
    Recommends the next best course, article, or video for a user to start.
    Combines Collaborative Filtering and Content-Based Filtering.
    """
    
    def __init__(self):
        # Initialize the Gemini client
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY environment variable not set")
        
        self.client = genai.Client(api_key=api_key)
    
    def get_user_learning_profile(self, user_id: int, db) -> Dict:
        """Extract user's learning patterns and preferences"""
        resources = prisma(db).resources.find_many(
            where={"user_id": user_id},
            include={
                "resource_type": True,
                "resource_platform": True
            }
        )
        
        # Analyze completion patterns
        completed = [r for r in resources if r.progress_status == "completed"]
        in_progress = [r for r in resources if r.progress_status == "in_progress"]
        
        # Extract preferences
        preferred_types = {}
        preferred_platforms = {}
        avg_rating = 0
        total_ratings = 0
        
        for resource in completed:
            if resource.resource_type:
                type_name = resource.resource_type.name
                preferred_types[type_name] = preferred_types.get(type_name, 0) + 1
            
            if resource.resource_platform:
                platform_name = resource.resource_platform.name
                preferred_platforms[platform_name] = preferred_platforms.get(platform_name, 0) + 1
            
            if resource.rating:
                avg_rating += resource.rating
                total_ratings += 1
        
        avg_rating = avg_rating / total_ratings if total_ratings > 0 else 0
        
        return {
            "total_resources": len(resources),
            "completed_count": len(completed),
            "in_progress_count": len(in_progress),
            "preferred_types": preferred_types,
            "preferred_platforms": preferred_platforms,
            "average_rating": avg_rating,
            "completed_resources": [r.name for r in completed],
            "in_progress_resources": [r.name for r in in_progress]
        }
    
    async def get_recommendations(
        self, 
        user_id: int, 
        db,
        limit: int = 5
    ) -> List[Dict]:
        """
        Generate personalized resource recommendations using AI
        """
        profile = self.get_user_learning_profile(user_id, db)
        
        # Get all available resources (not started by user)
        all_user_resources = prisma(db).resources.find_many(
            where={"user_id": user_id}
        )
        not_started = [r for r in all_user_resources if r.progress_status == "not_started"]
        
        if not not_started:
            return []
        
        # Create prompt for AI recommendation
        prompt = f"""
You are a personalized learning advisor analyzing a student's learning journey.

User's Learning Profile:
- Total Resources: {profile['total_resources']}
- Completed: {profile['completed_count']}
- In Progress: {profile['in_progress_count']}
- Average Rating Given: {profile['average_rating']:.1f}/5
- Preferred Resource Types: {', '.join([f"{k} ({v}x)" for k, v in profile['preferred_types'].items()]) if profile['preferred_types'] else 'None yet'}
- Preferred Platforms: {', '.join([f"{k} ({v}x)" for k, v in profile['preferred_platforms'].items()]) if profile['preferred_platforms'] else 'None yet'}
- Completed Resources: {', '.join(profile['completed_resources']) if profile['completed_resources'] else 'None yet'}
- Currently Learning: {', '.join(profile['in_progress_resources']) if profile['in_progress_resources'] else 'None'}

Resources Not Yet Started:
{chr(10).join([f"- {r.name} (Type: {r.resource_type.name if r.resource_type else 'N/A'}, Platform: {r.resource_platform.name if r.resource_platform else 'N/A'})" for r in not_started[:20]])}

Task: Recommend the top {limit} resources for this user to start next, considering:
1. Alignment with their preferred types and platforms
2. Logical progression from completed resources
3. Variety to expand their skillset
4. Resources that complement their current in-progress items

Return ONLY a JSON array with resource names and brief reasons (2-3 sentences each):
[
  {{"resource_name": "exact name from list", "reason": "why this is recommended", "priority": 1}},
  ...
]
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
            recommendations = json.loads(response.text)
            
            # Enrich recommendations with full resource data
            result = []
            for rec in recommendations[:limit]:
                matching_resource = next(
                    (r for r in not_started if r.name == rec['resource_name']),
                    None
                )
                if matching_resource:
                    result.append({
                        "resource_id": matching_resource.id,
                        "resource_name": matching_resource.name,
                        "resource_type": matching_resource.resource_type.name if matching_resource.resource_type else None,
                        "platform": matching_resource.resource_platform.name if matching_resource.resource_platform else None,
                        "reason": rec['reason'],
                        "priority": rec.get('priority', len(result) + 1)
                    })
            
            return result
            
        except Exception as e:
            print(f"Error generating recommendations: {str(e)}")
            return []


# Singleton instance
_recommendation_engine = None

def get_recommendation_engine() -> ResourceRecommendationEngine:
    global _recommendation_engine
    if _recommendation_engine is None:
        _recommendation_engine = ResourceRecommendationEngine()
    return _recommendation_engine
