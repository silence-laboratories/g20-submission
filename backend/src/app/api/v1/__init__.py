from fastapi import APIRouter

from .google_auth import router as google_auth_router
from .login import router as login_router
from .logout import router as logout_router
from .users import router as users_router
from .banks import router as banks_router
from .smes import router as smes_router
from .loans import router as loans_router
from .upload import router as upload_router
from .query import router as query_router

router = APIRouter(prefix="/v1")
router.include_router(login_router)
router.include_router(logout_router)
router.include_router(google_auth_router, prefix="/auth")
router.include_router(users_router)
router.include_router(banks_router)
router.include_router(smes_router)
router.include_router(loans_router)
router.include_router(upload_router)
router.include_router(query_router)