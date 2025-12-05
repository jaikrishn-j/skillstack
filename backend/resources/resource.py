from database.db import get_db
from database.models import User
from database.db import prisma
from authentication.auth import get_current_user
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional
from fastapi import HTTPException, status
from database.models import ResourceType, ResourcePlatform
from datetime import datetime



router = APIRouter()



class ResourceCreate(BaseModel):
    name: str
    resource_type_id: Optional[int] = None
    resource_platform_id: Optional[int] = None
    description: Optional[str] = None
    notes: Optional[str] = None
    rating: Optional[int] = None
    progress_status: Optional[str] = "not_started"  # not_started, in_progress, completed
    estimated_hours: Optional[int] = None
    hours_spent: Optional[int] = 0

class ResourceUpdate(BaseModel):
    name: Optional[str] = None
    resource_type_id: Optional[int] = None  # Changed from resourceTypeId
    resource_platform_id: Optional[int] = None  # Changed from resourcePlatformId
    description: Optional[str] = None
    notes: Optional[str] = None
    rating: Optional[int] = None
    progress_status: Optional[str] = None
    estimated_hours: Optional[int] = None
    hours_spent: Optional[int] = None

class ResourceTypeCreate(BaseModel):
    name: str

class ResourcePlatformCreate(BaseModel):
    name: str





@router.get("/resources")
def get_resources(current_user: User = Depends(get_current_user), db=Depends(get_db)):
    my_resources = prisma(db).resources.find_many(where={"user_id": current_user.id})
    return my_resources



@router.post("/resources", status_code=status.HTTP_201_CREATED)
def create_resource(resource: ResourceCreate, current_user: User = Depends(get_current_user), db=Depends(get_db)):
    # Prepare data - only include fields that have values
    data = {
        "name": resource.name,
        "user_id": current_user.id,
        "progress_status": resource.progress_status or "not_started",
        "hours_spent": resource.hours_spent or 0,
    }
    
    # Only add resource_type_id if it's provided
    if resource.resource_type_id:
        # Check if it exists first
        resource_type = prisma(db).resourcetype.find_first(
            where={"id": resource.resource_type_id, "user_id": current_user.id}
        )
        if resource_type:
            data["resource_type_id"] = resource.resource_type_id
        else:
            # If doesn't exist, don't include it (will be NULL)
            pass
    
    # Only add resource_platform_id if it's provided
    if resource.resource_platform_id:
        # Check if it exists first
        resource_platform = prisma(db).resourceplatform.find_first(
            where={"id": resource.resource_platform_id, "user_id": current_user.id}
        )
        if resource_platform:
            data["resource_platform_id"] = resource.resource_platform_id
    
    # Add optional fields if they exist
    if resource.description:
        data["description"] = resource.description
    if resource.notes:
        data["notes"] = resource.notes
    if resource.rating:
        data["rating"] = resource.rating
    if resource.estimated_hours:
        data["estimated_hours"] = resource.estimated_hours
    
    # Auto-set started_date if progress is in_progress or completed
    if resource.progress_status in ["in_progress", "completed"]:
        data["started_date"] = datetime.utcnow()
    
    # Auto-set completion_date if completed
    if resource.progress_status == "completed":
        data["completion_date"] = datetime.utcnow()
    
    new_resource = prisma(db).resources.create(data=data)
    return new_resource
@router.get("/resources/{resource_id}")
def get_resource(resource_id: int, current_user: User = Depends(get_current_user), db=Depends(get_db)):
    resource = prisma(db).resources.find_first(
        where={"id": resource_id, "user_id": current_user.id}
    )
    if not resource:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found or not authorized")
    return resource

@router.put("/resources/{resource_id}")
def update_resource(
    resource_id: int, resource_data: ResourceUpdate, current_user: User = Depends(get_current_user), db=Depends(get_db)
):
    existing_resource = prisma(db).resources.find_first(
        where={"id": resource_id, "user_id": current_user.id}
    )
    if not existing_resource:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found or not authorized")

    update_data = {}
    if resource_data.name is not None:
        update_data["name"] = resource_data.name
    if resource_data.resource_type_id is not None:  # Changed from resourceTypeId
        # Check if the resource type exists for this user
        resource_type = prisma(db).resourcetype.find_first(
            where={"id": resource_data.resource_type_id, "user_id": current_user.id}
        )
        if resource_type:
            update_data["resource_type_id"] = resource_data.resource_type_id
        # If the type doesn't exist, we simply don't include it in the update
    if resource_data.resource_platform_id is not None:  # Changed from resourcePlatformId
        # Check if the resource platform exists for this user
        resource_platform = prisma(db).resourceplatform.find_first(
            where={"id": resource_data.resource_platform_id, "user_id": current_user.id}
        )
        if resource_platform:
            update_data["resource_platform_id"] = resource_data.resource_platform_id
        # If the platform doesn't exist, we simply don't include it in the update
    if resource_data.description is not None:
        update_data["description"] = resource_data.description
    if resource_data.notes is not None:
        update_data["notes"] = resource_data.notes
    if resource_data.rating is not None:
        update_data["rating"] = resource_data.rating
    if resource_data.estimated_hours is not None:
        update_data["estimated_hours"] = resource_data.estimated_hours
    if resource_data.hours_spent is not None:
        update_data["hours_spent"] = resource_data.hours_spent
    
    # Handle progress status changes
    if resource_data.progress_status is not None:
        update_data["progress_status"] = resource_data.progress_status
        
        # Auto-set started_date if moving to in_progress and not already set
        if resource_data.progress_status == "in_progress" and not existing_resource.started_date:
            update_data["started_date"] = datetime.utcnow()
        
        # Auto-set completion_date if moving to completed
        if resource_data.progress_status == "completed" and existing_resource.progress_status != "completed":
            update_data["completion_date"] = datetime.utcnow()
            # Also set started_date if not already set
            if not existing_resource.started_date:
                update_data["started_date"] = datetime.utcnow()

    updated_resource = prisma(db).resources.update(
        where={"id": resource_id},
        data=update_data,  # Use the fixed update_data
    )
    return updated_resource

@router.delete("/resources/{resource_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_resource(resource_id: int, current_user: User = Depends(get_current_user), db=Depends(get_db)):
    existing_resource = prisma(db).resources.find_first(
        where={"id": resource_id, "user_id": current_user.id}
    )
    if not existing_resource:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found or not authorized")

    prisma(db).resources.delete(where={"id": resource_id})
    return {"message": "Resource deleted successfully"}

@router.post("/resource-types", status_code=status.HTTP_201_CREATED)
def create_resource_types(resource_type: ResourceTypeCreate, current_user: User = Depends(get_current_user), db=Depends(get_db)):
    existing_resource_type = prisma(db).resourcetype.find_first(where={"name": resource_type.name, "user_id": current_user.id})
    if existing_resource_type:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Resource type already exists")

    new_resource_type_data = {
        "name": resource_type.name,
        "user_id": current_user.id,
        "created_at": datetime.utcnow(),
    }
    created_type = prisma(db).resourcetype.create(data=new_resource_type_data)
    return created_type

@router.get("/resource-types")
def get_resource_types(current_user: User = Depends(get_current_user), db=Depends(get_db)):
    return prisma(db).resourcetype.find_many(where={"user_id": current_user.id})

@router.post("/resource-platforms", status_code=status.HTTP_201_CREATED)
def create_resource_platforms(resource_platform: ResourcePlatformCreate, current_user: User = Depends(get_current_user), db=Depends(get_db)):
    existing_resource_platform = prisma(db).resourceplatform.find_first(where={"name": resource_platform.name, "user_id": current_user.id})
    if existing_resource_platform:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Resource platform already exists")
    
    new_resource_platform_data = {
        "name": resource_platform.name,
        "user_id": current_user.id,
        "created_at": datetime.utcnow(),
    }
    created_platform = prisma(db).resourceplatform.create(data=new_resource_platform_data)
    return created_platform
    
@router.get("/resource-platforms")
def get_resource_platforms(current_user: User = Depends(get_current_user), db=Depends(get_db)):
    return prisma(db).resourceplatform.find_many(where={"user_id": current_user.id})


class ResourceTypeUpdate(BaseModel):
    name: str

class ResourcePlatformUpdate(BaseModel):
    name: str


@router.put("/resource-types/{type_id}")
def update_resource_type(
    type_id: int, type_data: ResourceTypeUpdate, current_user: User = Depends(get_current_user), db=Depends(get_db)
):
    existing_type = prisma(db).resourcetype.find_first(
        where={"id": type_id, "user_id": current_user.id}
    )
    if not existing_type:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource type not found or not authorized")

    updated_type = prisma(db).resourcetype.update(
        where={"id": type_id},
        data={"name": type_data.name}
    )
    return updated_type


@router.delete("/resource-types/{type_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_resource_type(type_id: int, current_user: User = Depends(get_current_user), db=Depends(get_db)):
    existing_type = prisma(db).resourcetype.find_first(
        where={"id": type_id, "user_id": current_user.id}
    )
    if not existing_type:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource type not found or not authorized")

    # Check if used by any resource (optional but good practice)
    # For now, we'll let the DB handle constraints or just delete
    try:
        prisma(db).resourcetype.delete(where={"id": type_id})
    except Exception as e:
         raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot delete type that is in use")
    
    return {"message": "Resource type deleted successfully"}


@router.put("/resource-platforms/{platform_id}")
def update_resource_platform(
    platform_id: int, platform_data: ResourcePlatformUpdate, current_user: User = Depends(get_current_user), db=Depends(get_db)
):
    existing_platform = prisma(db).resourceplatform.find_first(
        where={"id": platform_id, "user_id": current_user.id}
    )
    if not existing_platform:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource platform not found or not authorized")

    updated_platform = prisma(db).resourceplatform.update(
        where={"id": platform_id},
        data={"name": platform_data.name}
    )
    return updated_platform


@router.delete("/resource-platforms/{platform_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_resource_platform(platform_id: int, current_user: User = Depends(get_current_user), db=Depends(get_db)):
    existing_platform = prisma(db).resourceplatform.find_first(
        where={"id": platform_id, "user_id": current_user.id}
    )
    if not existing_platform:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource platform not found or not authorized")

    try:
        prisma(db).resourceplatform.delete(where={"id": platform_id})
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot delete platform that is in use")

    return {"message": "Resource platform deleted successfully"}

@router.get("/resources/stats/overview")
def get_resource_stats(current_user: User = Depends(get_current_user), db=Depends(get_db)):
    resources = prisma(db).resources.find_many(where={"user_id": current_user.id})
    
    total_resources = len(resources)
    if total_resources == 0:
        return {
            "total_resources": 0,
            "completed_resources": 0,
            "in_progress_resources": 0,
            "not_started_resources": 0,
            "completion_rate": 0,
            "total_estimated_hours": 0,
            "total_hours_spent": 0
        }
        
    completed = sum(1 for r in resources if r.progress_status == "completed")
    in_progress = sum(1 for r in resources if r.progress_status == "in_progress")
    not_started = sum(1 for r in resources if r.progress_status == "not_started")
    
    total_estimated = sum(r.estimated_hours or 0 for r in resources)
    total_spent = sum(r.hours_spent or 0 for r in resources)
    
    return {
        "total_resources": total_resources,
        "completed_resources": completed,
        "in_progress_resources": in_progress,
        "not_started_resources": not_started,
        "completion_rate": (completed / total_resources) * 100,
        "total_estimated_hours": total_estimated,
        "total_hours_spent": total_spent
    }