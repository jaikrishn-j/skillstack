from database.create_tables import create_tables
from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from authentication.auth import router as authentication_router
from resources.resource import router as resource_router
from ai.routes import router as ai_router

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Add your frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    # Call the function which now checks for existing tables
    create_tables()

app.include_router(authentication_router, prefix="/auth", tags=["authentication"])
app.include_router(resource_router, prefix="/api", tags=["resources"])
app.include_router(ai_router, prefix="/api/ai", tags=["ai"])



@app.get("/health")
async def health_check():
    return {"status": "ok"}


