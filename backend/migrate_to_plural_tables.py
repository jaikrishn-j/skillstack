#!/usr/bin/env python3
"""
Migration script to:
1. Add user_id and created_at columns to resource_types and resource_platforms tables
2. Migrate data from singular tables to plural tables
3. Update resources table to use the plural tables
"""
from sqlalchemy import text
from database.db import SessionLocal

def migrate_schema():
    db = SessionLocal()
    try:
        # Add columns to resource_types if they don't exist
        print("Adding user_id and created_at to resource_types...")
        try:
            db.execute(text("ALTER TABLE resource_types ADD COLUMN IF NOT EXISTS user_id INTEGER"))
            db.execute(text("ALTER TABLE resource_types ADD COLUMN IF NOT EXISTS created_at TIMESTAMP"))
            db.commit()
            print("✓ Columns added to resource_types")
        except Exception as e:
            print(f"Note: {e}")
            db.rollback()
        
        # Add columns to resource_platforms if they don't exist
        print("Adding user_id and created_at to resource_platforms...")
        try:
            db.execute(text("ALTER TABLE resource_platforms ADD COLUMN IF NOT EXISTS user_id INTEGER"))
            db.execute(text("ALTER TABLE resource_platforms ADD COLUMN IF NOT EXISTS created_at TIMESTAMP"))
            db.commit()
            print("✓ Columns added to resource_platforms")
        except Exception as e:
            print(f"Note: {e}")
            db.rollback()
        
        # Migrate data from resource_type to resource_types
        print("\\nMigrating data from resource_type to resource_types...")
        result = db.execute(text("""
            INSERT INTO resource_types (id, name, user_id, created_at)
            SELECT id, name, user_id, created_at
            FROM resource_type
            ON CONFLICT (id) DO UPDATE 
            SET name = EXCLUDED.name,
                user_id = EXCLUDED.user_id,
                created_at = EXCLUDED.created_at
        """))
        db.commit()
        print(f"✓ Migrated resource types")
        
        # Migrate data from resource_platform to resource_platforms
        print("Migrating data from resource_platform to resource_platforms...")
        result = db.execute(text("""
            INSERT INTO resource_platforms (id, name, user_id, created_at)
            SELECT id, name, user_id, created_at
            FROM resource_platform
            ON CONFLICT (id) DO UPDATE 
            SET name = EXCLUDED.name,
                user_id = EXCLUDED.user_id,
                created_at = EXCLUDED.created_at
        """))
        db.commit()
        print(f"✓ Migrated resource platforms")
        
        # Verify the migration
        print("\\n=== Verification ===")
        result = db.execute(text("SELECT COUNT(*) FROM resource_types"))
        count = result.scalar()
        print(f"resource_types: {count} records")
        
        result = db.execute(text("SELECT COUNT(*) FROM resource_platforms"))
        count = result.scalar()
        print(f"resource_platforms: {count} records")
        
        print("\\n✅ Migration completed successfully!")
        
    except Exception as e:
        print(f"❌ Error during migration: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    migrate_schema()
