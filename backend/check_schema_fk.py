#!/usr/bin/env python3
"""
Script to check table names in the database
"""
from database.db import SessionLocal
from sqlalchemy import inspect

def check_tables():
    db = SessionLocal()
    inspector = inspect(db.bind)
    
    print("\n=== All Tables ===")
    for table_name in inspector.get_table_names():
        print(f"Table: {table_name}")
        
        # Get foreign keys
        fks = inspector.get_foreign_keys(table_name)
        if fks:
            print(f"  Foreign Keys:")
            for fk in fks:
                print(f"    {fk['name']}: {fk['constrained_columns']} -> {fk['referred_table']}.{fk['referred_columns']}")
    
    db.close()

if __name__ == "__main__":
    check_tables()
