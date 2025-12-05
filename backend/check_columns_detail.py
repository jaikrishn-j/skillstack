#!/usr/bin/env python3
"""
Script to check columns in tables
"""
from database.db import SessionLocal
from sqlalchemy import inspect

def check_columns():
    db = SessionLocal()
    inspector = inspect(db.bind)
    
    tables_to_check = ['resource_types', 'resource_platforms', 'resources']
    
    for table_name in tables_to_check:
        print(f"\n=== {table_name} ===")
        try:
            columns = inspector.get_columns(table_name)
            for col in columns:
                print(f"  {col['name']}: {col['type']}")
        except Exception as e:
            print(f"  Error: {e}")
    
    db.close()

if __name__ == "__main__":
    check_columns()
