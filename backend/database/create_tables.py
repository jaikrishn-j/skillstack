# create_tables.py
from database.db import engine
from database.models import Base
from sqlalchemy import inspect # Import inspect

def create_tables():
    # Create an inspector instance
    inspector = inspect(engine)
    
    # Get a list of existing table names
    existing_tables = inspector.get_table_names()
    
    # Get all table names defined in models
    model_tables = Base.metadata.tables.keys()
    
    # Find missing tables
    missing_tables = set(model_tables) - set(existing_tables)
    
    if missing_tables:
        print(f"Creating missing tables: {missing_tables}")
        # Create all tables (SQLAlchemy will skip existing ones)
        Base.metadata.create_all(bind=engine)
        print("Tables created successfully!")
    else:
        print("All tables already exist.")

# Note: The Base and engine imports must be correct for this to work.