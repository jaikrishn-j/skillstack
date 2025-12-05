"""
Check and migrate data from singular to plural tables
"""
from database.db import engine
from sqlalchemy import text

with engine.connect() as conn:
    # Check resource_type (old singular)
    result = conn.execute(text("SELECT COUNT(*) FROM resource_type"))
    old_type_count = result.scalar()
    
    # Check resource_types (new plural)
    result = conn.execute(text("SELECT COUNT(*) FROM resource_types"))
    new_type_count = result.scalar()
    
    # Check resource_platform (old singular)
    result = conn.execute(text("SELECT COUNT(*) FROM resource_platform"))
    old_platform_count = result.scalar()
    
    # Check resource_platforms (new plural)
    result = conn.execute(text("SELECT COUNT(*) FROM resource_platforms"))
    new_platform_count = result.scalar()
    
    print(f"resource_type (old): {old_type_count} rows")
    print(f"resource_types (new): {new_type_count} rows")
    print(f"resource_platform (old): {old_platform_count} rows")
    print(f"resource_platforms (new): {new_platform_count} rows")
    print()
    
    # If old tables have data and new tables are empty, migrate
    if old_type_count > 0 and new_type_count == 0:
        print("Migrating resource_type data to resource_types...")
        conn.execute(text("""
            INSERT INTO resource_types (id, name, user_id, created_at)
            SELECT id, name, user_id, created_at FROM resource_type
        """))
        conn.commit()
        print(f"✓ Migrated {old_type_count} resource types")
    
    if old_platform_count > 0 and new_platform_count == 0:
        print("Migrating resource_platform data to resource_platforms...")
        conn.execute(text("""
            INSERT INTO resource_platforms (id, name, user_id, created_at)
            SELECT id, name, user_id, created_at FROM resource_platform
        """))
        conn.commit()
        print(f"✓ Migrated {old_platform_count} resource platforms")
    
    if old_type_count == 0 and old_platform_count == 0:
        print("✓ No migration needed - using plural tables already")
    
    # Show final counts
    print("\nFinal counts:")
    result = conn.execute(text("SELECT COUNT(*) FROM resource_types"))
    print(f"  resource_types: {result.scalar()} rows")
    
    result = conn.execute(text("SELECT COUNT(*) FROM resource_platforms"))
    print(f"  resource_platforms: {result.scalar()} rows")
