from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String)
    password = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    
    resources = relationship("Resources", back_populates="user")
    

    @property
    def resource_types(self):
        return list(set([r.resource_type for r in self.resources if r.resource_type]))
    
    @property
    def resource_platforms(self):
        return list(set([r.resource_platform for r in self.resources if r.resource_platform]))

class Resources(Base):
    __tablename__ = "resources"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    user_id = Column(Integer, ForeignKey("users.id"))
    resource_type_id = Column(Integer, ForeignKey("resource_types.id"))
    resource_platform_id = Column(Integer, ForeignKey("resource_platforms.id"))
    description = Column(String)
    notes = Column(String)
    rating = Column(Integer)
    
    # Progress tracking fields
    progress_status = Column(String, default="not_started")  # not_started, in_progress, completed
    estimated_hours = Column(Integer)
    hours_spent = Column(Integer, default=0)
    completion_date = Column(DateTime)
    started_date = Column(DateTime)
    
    # AI-generated fields
    ai_summary = Column(String)  # AI-generated summary of notes
    ai_tags = Column(String)  # Comma-separated AI-generated tags
    ai_category = Column(String)  # AI-generated category
    ai_mastery_date = Column(DateTime)  # AI-predicted completion date
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="resources")
    
    resource_type = relationship("ResourceType", back_populates="resources")
    
    resource_platform = relationship("ResourcePlatform", back_populates="resources")

class ResourceType(Base):
    __tablename__ = "resource_types"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # null means system-wide
    created_at = Column(DateTime, default=datetime.utcnow)

    resources = relationship("Resources", back_populates="resource_type")
    

class ResourcePlatform(Base):
    __tablename__ = "resource_platforms"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # null means system-wide
    created_at = Column(DateTime, default=datetime.utcnow)

    resources = relationship("Resources", back_populates="resource_platform")