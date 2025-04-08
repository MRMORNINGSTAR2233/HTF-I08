from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi

from app.api.v1 import auth, users, database, chat
from app.core.config import settings
from .routers import file_upload, data_preview

# Initialize FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Set all CORS enabled origins
if settings.CORS_ORIGINS:
    origins = []
    for origin in settings.CORS_ORIGINS:
        # Check if it's a wildcard or a valid URL
        if origin == "*":
            origins = ["*"]
            break
        else:
            origins.append(str(origin))
            
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Include API routers - corrected prefix structure
app.include_router(
    auth.router,
    prefix=settings.API_V1_STR,
    tags=["authentication"]
)

app.include_router(
    users.router,
    prefix=f"{settings.API_V1_STR}/users",
    tags=["users"]
)

app.include_router(
    database.router,
    prefix=f"{settings.API_V1_STR}/databases",
    tags=["databases"]
)

app.include_router(
    chat.router,
    prefix=settings.API_V1_STR,
    tags=["chats"]
)

app.include_router(
    file_upload.router,
    prefix=settings.API_V1_STR,
    tags=["file-upload"]
)

app.include_router(
    data_preview.router,
    prefix=settings.API_V1_STR,
    tags=["data-preview"]
)

# Root endpoint
@app.get("/")
def root():
    """
    Root endpoint with API information
    """
    return {
        "message": "Welcome to Voi2Viz API",
        "version": "1.0.0",
        "documentation": f"/docs",
    }


def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    
    openapi_schema = get_openapi(
        title=f"{settings.PROJECT_NAME} API",
        version="1.0.0",
        description="API for managing database configurations and executing queries",
        routes=app.routes,
    )
    
    app.openapi_schema = openapi_schema
    return app.openapi_schema


app.openapi = custom_openapi