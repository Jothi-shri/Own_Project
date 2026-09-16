"""Auth package — re-exports router and helpers for backward compatibility."""

from .router import (
    router,
    make_token,
    make_refresh_token,
    current_user,
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    get_current_user,
)
from .schemas import RegisterIn, LoginIn, AdminLoginIn, RefreshIn
from .security import decode_token

__all__ = [
    "router",
    "RegisterIn",
    "LoginIn",
    "AdminLoginIn",
    "RefreshIn",
    "hash_password",
    "verify_password",
    "create_access_token",
    "create_refresh_token",
    "make_token",
    "make_refresh_token",
    "get_current_user",
    "current_user",
    "decode_token",
]
