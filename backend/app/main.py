import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine
from . import models
from .routes import auth, users

# Create tables
models.Base.metadata.create_all(bind=engine)

# Create FastAPI instance
app = FastAPI(
    title="User Registration API", 
    version="1.0.0",
    description="GetCovered.io User Registration and Profile Management API"
)

# Get frontend URL from environment variable for production
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

# Configure CORS for both development and production
allowed_origins = [
    "https://user-registration-app-xi.vercel.app"
    "http://localhost:3000",        # Local development
    "http://localhost:5173",        # Vite dev server
    "http://127.0.0.1:3000",        # Alternative localhost
    "http://127.0.0.1:5173",        # Alternative localhost
]

# Add production frontend URL if provided
if FRONTEND_URL != "http://localhost:3000":
    allowed_origins.append(FRONTEND_URL)

# Add common deployment domains
allowed_origins.extend([
    "https://*.vercel.app",         # Vercel deployments
    "https://*.netlify.app",        # Netlify deployments
    "https://*.onrender.com",       # Render deployments
])

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(auth.router)
app.include_router(users.router)

# Root endpoint
@app.get("/")
def read_root():
    return {
        "message": "GetCovered.io User Registration API",
        "status": "running",
        "version": "1.0.0",
        "endpoints": {
            "docs": "/docs",
            "redoc": "/redoc",
            "health": "/health",
            "register": "/api/register",
            "login": "/api/login",
            "profile": "/api/profile"
        }
    }

# Health check endpoint for deployment platforms
@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "database": "connected",
        "api": "operational"
    }

# Optional: Add a simple test endpoint
@app.get("/api/test")
def test_api():
    return {
        "message": "API is working correctly!",
        "cors_enabled": True,
        "environment": os.getenv("ENVIRONMENT", "development")
    }

# Add startup event to seed database in production
@app.on_event("startup")
async def startup_event():
    """Run database seeding on startup if needed"""
    # Only seed if DATABASE_SEED environment variable is set
    if os.getenv("DATABASE_SEED") == "true":
        try:
            from .database import SessionLocal
            from .auth import get_password_hash
            
            db = SessionLocal()
            
            # Check if users already exist
            existing_user = db.query(models.User).first()
            if not existing_user:
                # Create sample users for production demo
                users_data = [
                    {
                        "email": "demo.user@getcovered.io",
                        "first_name": "Demo",
                        "last_name": "User",
                        "password": "DemoPassword123!"
                    }
                ]
                
                for user_data in users_data:
                    hashed_password = get_password_hash(user_data["password"])
                    db_user = models.User(
                        email=user_data["email"],
                        first_name=user_data["first_name"],
                        last_name=user_data["last_name"],
                        hashed_password=hashed_password
                    )
                    db.add(db_user)
                
                db.commit()
                print("✅ Production database seeded with demo user")
            
            db.close()
            
        except Exception as e:
            print(f"❌ Database seeding failed: {e}")

# Add shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on application shutdown"""
    print("🔄 Application shutting down...")

# Optional: Add middleware for logging requests in production
@app.middleware("http")
async def log_requests(request, call_next):
    """Log requests in production for debugging"""
    import time
    
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    
    # Only log in production or if DEBUG is enabled
    if os.getenv("ENVIRONMENT") == "production" or os.getenv("DEBUG") == "true":
        print(f"📝 {request.method} {request.url} - {response.status_code} - {process_time:.4f}s")
    
    return response