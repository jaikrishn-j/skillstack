#!/usr/bin/env python3
"""
Script to fix resources with invalid resource_type_id and resource_platform_id
"""
from database.db import SessionLocal
from database.models import Resources, ResourceType, ResourcePlatform

def fix_resources():
    db = SessionLocal()
    try:
        # Get all resources
        resources = db.query(Resources).all()
        
        print(f"Found {len(resources)} resources")
        
        fixed_count = 0
        for resource in resources:
            needs_update = False
            
            # Check if resource_type_id is valid
            if resource.resource_type_id is not None:
                resource_type = db.query(ResourceType).filter(
                    ResourceType.id == resource.resource_type_id
                ).first()
                if not resource_type:
                    print(f"Resource {resource.id} has invalid resource_type_id={resource.resource_type_id}, setting to None")
                    resource.resource_type_id = None
                    needs_update = True
            
            # Check if resource_platform_id is valid
            if resource.resource_platform_id is not None:
                resource_platform = db.query(ResourcePlatform).filter(
                    ResourcePlatform.id == resource.resource_platform_id
                ).first()
                if not resource_platform:
                    print(f"Resource {resource.id} has invalid resource_platform_id={resource.resource_platform_id}, setting to None")
                    resource.resource_platform_id = None
                    needs_update = True
            
            if needs_update:
                fixed_count += 1
        
        if fixed_count > 0:
            db.commit()
            print(f"\nFixed {fixed_count} resources")
        else:
            print("\nNo resources needed fixing")
            
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    fix_resources()
