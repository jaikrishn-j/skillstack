"""
Check schema of both table versions
"""
from database.db import engine
from sqlalchemy import text

with engine.connect() as conn:
    print("=== resource_type (old singular) columns ===")
    result = conn.execute(text("""
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'resource_type'
        ORDER BY ordinal_position;
    """))
    for row in result:
        print(f"  {row[0]}: {row[1]}")
    
    print("\n=== resource_types (new plural) columns ===")
    result = conn.execute(text("""
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'resource_types'
        ORDER BY ordinal_position;
    """))
    for row in result:
        print(f"  {row[0]}: {row[1]}")
    
    print("\n=== resource_platform (old singular) columns ===")
    result = conn.execute(text("""
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'resource_platform'
        ORDER BY ordinal_position;
    """))
    for row in result:
        print(f"  {row[0]}: {row[1]}")
    
    print("\n=== resource_platforms (new plural) columns ===")
    result = conn.execute(text("""
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'resource_platforms'
        ORDER BY ordinal_position;
    """))
    for row in result:
        print(f"  {row[0]}: {row[1]}")
