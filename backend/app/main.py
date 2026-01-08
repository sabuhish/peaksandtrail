from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import auth, participants, tours
from app.core.config import settings

app = FastAPI(
    title="Tour Management API",
    description="API for managing tours and participants",
    version="0.1.0",
    docs_url="/docs" if settings.environment == "development" else None,
    redoc_url="/redoc" if settings.environment == "development" else None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://46.224.199.110:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(tours.router, prefix="/api")
app.include_router(participants.router, prefix="/api")


@app.get("/")
async def root():
    return {"message": "Tour Management API"}


@app.get("/health")
async def health():
    return {"status": "healthy"}
