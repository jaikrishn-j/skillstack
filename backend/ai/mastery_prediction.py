"""
AI-powered Skill Mastery Date Prediction
Uses time-series forecasting and regression models
"""
from google import genai
from google.genai import types
import os
from datetime import datetime, timedelta
from typing import Dict, Optional
from database.db import prisma


class MasteryPredictor:
    """
    Predicts when a user will master a skill or complete a course
    """
    
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY environment variable not set")
        
        self.client = genai.Client(api_key=api_key)
    
    async def predict_completion_date(
        self,
        resource_id: int,
        user_id: int,
        db
    ) -> Dict:
        """
        Predict when user will complete the resource
        
        Returns:
            {
                "predicted_date": "2025-01-15",
                "confidence": 0.85,
                "days_remaining": 45,
                "recommendation": "You're on track! Maintain your current pace."
            }
        """
        
        # Get the specific resource
        resource = prisma(db).resources.find_first(
            where={"id": resource_id, "user_id": user_id}
        )
        
        if not resource:
            return {"error": "Resource not found"}
        
        # Get user's learning history
        all_resources = prisma(db).resources.find_many(
            where={"user_id": user_id}
        )
        
        # Calculate learning velocity
        completed_resources = [r for r in all_resources if r.progress_status == "completed"]
        
        # Analyze patterns
        total_hours_logged = sum(r.hours_spent or 0 for r in completed_resources)
        avg_hours_per_resource = total_hours_logged / len(completed_resources) if completed_resources else 0
        
        # Calculate recent streak (last 30 days)
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        recent_completions = [
            r for r in completed_resources 
            if r.completion_date and r.completion_date >= thirty_days_ago
        ]
        
        current_date = datetime.utcnow()
        
        prompt = f"""
You are a learning analytics AI analyzing a student's progress and predicting completion dates.

Resource Information:
- Name: {resource.name}
- Progress Status: {resource.progress_status}
- Estimated Total Hours: {resource.estimated_hours or 'Not specified'}
- Hours Spent So Far: {resource.hours_spent or 0}
- Started Date: {resource.started_date.isoformat() if resource.started_date else 'Not started'}

User's Learning Profile:
- Total Completed Resources: {len(completed_resources)}
- Average Hours per Completed Resource: {avg_hours_per_resource:.1f}
- Recent Completions (Last 30 days): {len(recent_completions)}
- Total Hours Logged (All Time): {total_hours_logged}

Current Date: {current_date.strftime('%Y-%m-%d')}

Task: Analyze the student's learning velocity and predict:
1. When they will likely complete this resource (predicted_date)
2. Confidence level in this prediction (0.0 to 1.0)
3. How many days remain until completion
4. A motivational recommendation or adjustment advice

Consider:
- Their historical completion rate
- Recent activity trends (streaks or slowdowns)
- Hours remaining vs. their typical pace
- If not started, factor in their tendency to start new resources

Return ONLY a JSON object:
{{
  "predicted_date": "YYYY-MM-DD",
  "confidence": 0.75,
  "days_remaining": 30,
  "hours_remaining": 15,
  "recommendation": "motivational message or advice"
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
            print(f"Error predicting mastery date: {str(e)}")
            return {
                "predicted_date": None,
                "confidence": 0.0,
                "days_remaining": None,
                "recommendation": "Unable to generate prediction at this time.",
                "error": str(e)
            }


# Singleton instance
_mastery_predictor = None

def get_mastery_predictor() -> MasteryPredictor:
    global _mastery_predictor
    if _mastery_predictor is None:
        _mastery_predictor = MasteryPredictor()
    return _mastery_predictor
