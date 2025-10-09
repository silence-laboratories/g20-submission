from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from starlette.middleware.cors import CORSMiddleware
from .api import router
from .core.config import settings
from .core.setup import create_application


app = create_application(router=router, settings=settings)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://sl-compute-app.silencelaboratories.com"],  # Specify allowed origins
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH"],           # Specify allowed methods
    allow_headers=["*"],
)
