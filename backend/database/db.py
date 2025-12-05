from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from database.models import Base
import database.models as models  # ADD THIS IMPORT
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is not set")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class PrismaModelWrapper:
    def __init__(self, db: Session, model):
        self.db = db
        self.model = model

    def create(self, data):
        obj = self.model(**data)
        self.db.add(obj)
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def find_many(self, **kwargs):
        query = self.db.query(self.model)
        
        # Handle where conditions
        if "where" in kwargs:
            where_clause = kwargs["where"]
            for key, value in where_clause.items():
                if isinstance(value, dict):
                    for operator, op_value in value.items():
                        if operator == "equals":
                            query = query.filter(getattr(self.model, key) == op_value)
                        elif operator == "contains":
                            query = query.filter(getattr(self.model, key).contains(op_value))
                else:
                    query = query.filter(getattr(self.model, key) == value)
        
        return query.all()

    def find_unique(self, id: int):
        return self.db.query(self.model).filter(self.model.id == id).first()

    def find_first(self, **kwargs):
        """Find first record matching the where clause"""
        query = self.db.query(self.model)
        
        # Handle where conditions
        if "where" in kwargs:
            where_clause = kwargs["where"]
            for key, value in where_clause.items():
                # Handle different types of conditions
                if isinstance(value, dict):
                    # Handle operators like {"equals": value}
                    for operator, op_value in value.items():
                        if operator == "equals":
                            query = query.filter(getattr(self.model, key) == op_value)
                        elif operator == "contains":
                            query = query.filter(getattr(self.model, key).contains(op_value))
                        # Add more operators as needed
                else:
                    # Simple equality
                    query = query.filter(getattr(self.model, key) == value)
        
        return query.first()

    def update(self, where: dict, data: dict):
        # Extract id from where clause
        if "id" in where:
            obj = self.find_unique(where["id"])
        else:
            obj = self.find_first(where=where)
        
        if not obj:
            return None
        
        for k, v in data.items():
            setattr(obj, k, v)
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def delete(self, where: dict):
        # Extract id from where clause
        if "id" in where:
            obj = self.find_unique(where["id"])
        else:
            obj = self.find_first(where=where)
        
        if obj:
            self.db.delete(obj)
            self.db.commit()
        return obj


class Prisma:
    def __init__(self, db: Session):
        # auto-map all models inside models.py
        for name in dir(models):
            attr = getattr(models, name)
            if hasattr(attr, "__tablename__"):   # it's a model
                setattr(self, name.lower(), PrismaModelWrapper(db, attr))


def prisma(db: Session):
    return Prisma(db)