# app/middlewares.py
import uuid
import time
import logging
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from app.logging_conf import request_id_var

access_logger = logging.getLogger("app.access")

class RequestContextMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        token = None
        try:
            # request_id מלקוח (x-request-id) או יצירה מקומית
            request_id = request.headers.get("x-request-id") or str(uuid.uuid4())
            token = request_id_var.set(request_id)

            start = time.perf_counter()
            response = await call_next(request)
            elapsed_ms = int((time.perf_counter() - start) * 1000)

            access_logger.info(
                "HTTP %s %s -> %s in %dms ua=%s ip=%s",
                request.method,
                request.url.path,
                getattr(response, "status_code", "?"),
                elapsed_ms,
                request.headers.get("user-agent", "-"),
                request.client.host if request.client else "-",
            )
            return response
        finally:
            if token is not None:
                request_id_var.reset(token)
