"""
AI Features API Routes
Handles all AI-powered features for the SkillStack application
"""
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional, List, Dict
from database.db import get_db, prisma
from database.models import User
from authentication.auth import get_current_user
from ai.recommendations import get_recommendation_engine
from ai.summarization import get_note_summarizer
from ai.mastery_prediction import get_mastery_predictor
from ai.categorization import get_auto_categorizer
from datetime import datetime

router = APIRouter()


# Request/Response Models
class SummarizeNotesRequest(BaseModel):
    resource_id: int
    save_to_resource: bool = True


class PredictMasteryRequest(BaseModel):
    resource_id: int
    save_to_resource: bool = True


class CategorizeResourceRequest(BaseModel):
    resource_id: int
    save_to_resource: bool = True


class RecommendationsResponse(BaseModel):
    recommendations: List[Dict]


# ================================================
# 1. PERSONALIZED RESOURCE RECOMMENDATIONS
# ================================================
@router.get("/recommendations", response_model=RecommendationsResponse)
async def get_personalized_recommendations(
    limit: int = 5,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Get AI-powered personalized resource recommendations
    Combines collaborative filtering and content-based filtering
    """
    try:
        engine = get_recommendation_engine()
        recommendations = await engine.get_recommendations(
            user_id=current_user.id,
            db=db,
            limit=limit
        )
        
        return {"recommendations": recommendations}
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate recommendations: {str(e)}"
        )


# ================================================
# 2. NOTE SUMMARIZATION & KEY CONCEPT EXTRACTION
# ================================================
@router.post("/summarize-notes")
async def summarize_resource_notes(
    request: SummarizeNotesRequest,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Generate AI summary and extract key concepts from resource notes
    """
    # Get the resource
    resource = prisma(db).resources.find_first(
        where={"id": request.resource_id, "user_id": current_user.id},
        include={
            "resource_type": True,
            "resource_platform": True
        }
    )
    
    if not resource:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resource not found"
        )
    
    if not resource.notes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Resource has no notes to summarize"
        )
     
    try:
        summarizer = get_note_summarizer()
        summary_result = await summarizer.summarize_notes(
            notes=resource.notes,
            resource_name=resource.name,
            resource_type=resource.resource_type.name if resource.resource_type else None
        )
        
        # Optionally save to resource
        if request.save_to_resource and summary_result.get("summary"):
            # Store summary and tags
            tags_str = ", ".join(summary_result.get("key_concepts", []))
            
            prisma(db).resources.update(
                where={"id": request.resource_id},
                data={
                    "ai_summary": summary_result["summary"],
                    "ai_tags": tags_str
                }
            )
        
        return {
            "resource_id": request.resource_id,
            "resource_name": resource.name,
            **summary_result
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to summarize notes: {str(e)}"
        )


# ================================================
# 3. PREDICTIVE SKILL MASTERY DATE
# ================================================
@router.post("/predict-mastery")
async def predict_skill_mastery(
    request: PredictMasteryRequest,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Predict when user will master the skill / complete the resource
    Uses time-series forecasting based on learning velocity
    """
    try:
        predictor = get_mastery_predictor()
        prediction = await predictor.predict_completion_date(
            resource_id=request.resource_id,
            user_id=current_user.id,
            db=db
        )
        
        # Optionally save prediction to resource
        if request.save_to_resource and prediction.get("predicted_date"):
            try:
                predicted_datetime = datetime.fromisoformat(prediction["predicted_date"])
                prisma(db).resources.update(
                    where={"id": request.resource_id},
                    data={"ai_mastery_date": predicted_datetime}
                )
            except:
                pass  # If date parsing fails, just don't save
        
        return {
            "resource_id": request.resource_id,
            **prediction
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to predict mastery date: {str(e)}"
        )


# ================================================
# 4. AUTO-CATEGORIZATION & SKILL TAGGING
# ================================================
@router.post("/categorize")
async def auto_categorize_resource(
    request: CategorizeResourceRequest,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Automatically categorize resource and assign skill tags
    Uses multi-label text classification
    """
    # Get the resource
    resource = prisma(db).resources.find_first(
        where={"id": request.resource_id, "user_id": current_user.id},
        include={
            "resource_type": True,
            "resource_platform": True
        }
    )
    
    if not resource:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resource not found"
        )
    
    try:
        categorizer = get_auto_categorizer()
        categorization = await categorizer.categorize_resource(
            resource_name=resource.name,
            description=resource.description,
            resource_type=resource.resource_type.name if resource.resource_type else None,
            platform=resource.resource_platform.name if resource.resource_platform else None
        )
        
        # Optionally save to resource
        if request.save_to_resource:
            # Store category and tags
            tags_str = ", ".join(categorization.get("skill_tags", []))
            
            prisma(db).resources.update(
                where={"id": request.resource_id},
                data={
                    "ai_category": categorization.get("category"),
                    "ai_tags": tags_str
                }
            )
        
        return {
            "resource_id": request.resource_id,
            "resource_name": resource.name,
            **categorization
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to categorize resource: {str(e)}"
        )


# ================================================
# 5. GET AI INSIGHTS FOR A RESOURCE
# ================================================
@router.get("/insights/{resource_id}")
async def get_resource_insights(
    resource_id: int,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Get all stored AI insights for a specific resource
    """
    resource = prisma(db).resources.find_first(
        where={"id": resource_id, "user_id": current_user.id}
    )
    
    if not resource:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resource not found"
        )
    
    return {
        "resource_id": resource.id,
        "resource_name": resource.name,
        "ai_summary": resource.ai_summary,
        "ai_tags": resource.ai_tags.split(", ") if resource.ai_tags else [],
        "ai_category": resource.ai_category,
        "ai_mastery_date": resource.ai_mastery_date.isoformat() if resource.ai_mastery_date else None
    }
