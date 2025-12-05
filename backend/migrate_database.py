"""
Database migration script to add new columns to resources table
"""
from database.db import engine
from sqlalchemy import text

def migrate_database():
    """Add new columns to resources table"""
    
    migrations = [
        # Add progress tracking columns
        "ALTER TABLE resources ADD COLUMN IF NOT EXISTS progress_status VARCHAR DEFAULT 'not_started'",
        "ALTER TABLE resources ADD COLUMN IF NOT EXISTS estimated_hours INTEGER",
        "ALTER TABLE resources ADD COLUMN IF NOT EXISTS hours_spent INTEGER DEFAULT 0",
        "ALTER TABLE resources ADD COLUMN IF NOT EXISTS completion_date TIMESTAMP",
        "ALTER TABLE resources ADD COLUMN IF NOT EXISTS started_date TIMESTAMP",
        
        # Add AI-generated columns
        "ALTER TABLE resources ADD COLUMN IF NOT EXISTS ai_summary TEXT",
        "ALTER TABLE resources ADD COLUMN IF NOT EXISTS ai_tags TEXT",
        "ALTER TABLE resources ADD COLUMN IF NOT EXISTS ai_category VARCHAR",
        "ALTER TABLE resources ADD COLUMN IF NOT EXISTS ai_mastery_date TIMESTAMP",
        
        # Add timestamp columns
        "ALTER TABLE resources ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
        "ALTER TABLE resources ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
    ]
    
    with engine.connect() as conn:
        for migration_sql in migrations:
            try:
                conn.execute(text(migration_sql))
                conn.commit()
                print(f"✓ Executed: {migration_sql[:70]}...")
            except Exception as e:
                # Column might already exist
                if "already exists" in str(e).lower() or "duplicate" in str(e).lower():
                    print(f"⊘ Skipped (already exists): {migration_sql[:70]}...")
                else:
                    print(f"✗ Error: {migration_sql[:70]}...")
                    print(f"  Details: {str(e)}")
        
        print("\n✅ Migration completed!")

if __name__ == "__main__":
    print("Starting database migration...\n")
    migrate_database()
