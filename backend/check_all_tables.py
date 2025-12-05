#!/usr/bin/env python3
"""
Script to check columns  in ALL tables including singular ones
"""
from database.db import SessionLocal
from sqlalchemy import inspect

def check_all_columns():
    db = SessionLocal()
    inspector = inspect(db.bind)
    
    for table_name in inspector.get_table_names():
        print(f"\n=== {table_name} ===")
        try:
            columns = inspector.get_columns(table_name)
            for col in columns:
                nullable = "NULL" if col.get('nullable', True) else "NOT NULL"
                print(f"  {col['name']}: {col['type']} {nullable}")
        except Exception as e:
            print(f"  Error: {e}")
    
    db.close()

if __name__ == "__main__":
    check_all_columns()
