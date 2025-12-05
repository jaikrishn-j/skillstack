"""
Quick test to check if columns exist
"""
from database.db import engine
from sqlalchemy import text

with engine.connect() as conn:
    result = conn.execute(text("""
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'resources'
        ORDER BY ordinal_position;
    """))
    
    columns = [row[0] for row in result]
    print("Columns in 'resources' table:")
    for col in columns:
        print(f"  - {col}")
    
    # Check for new columns
    new_columns = ['progress_status', 'estimated_hours', 'hours_spent', 
                  'completion_date', 'ai_summary', 'ai_tags', 'created_at']
    
    print("\nNew columns status:")
    for col in new_columns:
        status = "✓ EXISTS" if col in columns else "✗ MISSING"
        print(f"  {col}: {status}")
