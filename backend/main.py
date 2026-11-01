"""
minimal_todo — Backend API
Built on AINative Platform. Uses ZeroDB for storage, AINative JWT for auth.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from app.routers.authentication import router as authentication_router
from app.routers.user_management import router as user_management_router
from app.routers.create_to_do import router as create_to_do_router
from app.routers.complete_to_do import router as complete_to_do_router
from app.routers.delete_to_do import router as delete_to_do_router
from app.routers.list_to_do_items import router as list_to_do_items_router

app = FastAPI(
    title="minimal_todo API",
    version="0.1.0",
    description="Backend API for minimal_todo, powered by AINative platform"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://*.ainative.studio"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(authentication_router, prefix='/api/v1')
app.include_router(user_management_router, prefix='/api/v1')
app.include_router(create_to_do_router, prefix='/api/v1')
app.include_router(complete_to_do_router, prefix='/api/v1')
app.include_router(delete_to_do_router, prefix='/api/v1')
app.include_router(list_to_do_items_router, prefix='/api/v1')

@app.get("/health")
async def health():
    return {"status": "healthy", "service": "minimal_todo"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
