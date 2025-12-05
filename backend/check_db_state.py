#!/usr/bin/env python3
"""
Script to check the database state
"""
from database.db import SessionLocal
from database.models import Resources, ResourceType, ResourcePlatform, User

def check_database():
    db = SessionLocal()
    try:
        # Get all resource types
        resource_types = db.query(ResourceType).all()
        print(f"\n=== Resource Types ===")
        for rt in resource_types:
            print(f"ID: {rt.id}, Name: {rt.name}, User ID: {rt.user_id}")
        
        # Get all resource platforms
        resource_platforms = db.query(ResourcePlatform).all()
        print(f"\n=== Resource Platforms ===")
        for rp in resource_platforms:
            print(f"ID: {rp.id}, Name: {rp.name}, User ID: {rp.user_id}")
        
        # Get all resources
        resources = db.query(Resources).all()
        print(f"\n=== Resources ===")
        for r in resources:
            print(f"ID: {r.id}, Name: {r.name}, User ID: {r.user_id}, Type ID: {r.resource_type_id}, Platform ID: {r.resource_platform_id}")
        
        # Get all users
        users = db.query(User).all()
        print(f"\n=== Users ===")
        for u in users:
            print(f"ID: {u.id}, Email: {u.email}")
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    check_database()
