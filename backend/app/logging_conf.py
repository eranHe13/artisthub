# app/logging_conf.py
import os
import json
import logging
from logging.config import dictConfig
from typing import Any, Mapping
from contextvars import ContextVar
from app.settings import settings

# ContextVar ל-request_id
request_id_var: ContextVar[str] = ContextVar("request_id", default="-")

PLAIN_FMT = "%(asctime)s %(levelname)s [%(name)s] [%(request_id)s] %(message)s"
PLAIN_DATEFMT = "%Y-%m-%d %H:%M:%S"

class RequestIdFilter(logging.Filter):
    def filter(self, record: logging.LogRecord) -> bool:
        record.request_id = request_id_var.get("-")
        return True

class JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        log: Mapping[str, Any] = {
            "ts": self.formatTime(record, datefmt="%Y-%m-%dT%H:%M:%S"),
            "level": record.levelname,
            "logger": record.name,
            "request_id": getattr(record, "request_id", request_id_var.get("-")),
            "msg": record.getMessage(),
        }
        if record.exc_info:
            log["exc_info"] = self.formatException(record.exc_info)
        return json.dumps(log, ensure_ascii=False)

def _handlers():
    console = {
        "class": "logging.StreamHandler",
        "level": settings.LOG_LEVEL,
        "filters": ["request_id"],
        "formatter": "plain" if settings.LOG_FORMAT == "plain" else "json",
    }
    handlers = {"console": console}

    if settings.LOG_FILE:
        file_handler_class = "logging.handlers.RotatingFileHandler" if settings.LOG_ROTATE else "logging.FileHandler"
        file_h = {
            "class": file_handler_class,
            "level": settings.LOG_LEVEL,
            "filters": ["request_id"],
            "formatter": "plain" if settings.LOG_FORMAT == "plain" else "json",
            "filename": settings.LOG_FILE,
        }
        if settings.LOG_ROTATE:
            file_h["maxBytes"] = settings.LOG_MAX_BYTES
            file_h["backupCount"] = settings.LOG_BACKUPS
        handlers["file"] = file_h

    return handlers

def configure_logging() -> None:
    # ודא שהתיקייה ל-LOG_FILE קיימת (אם מוגדר)
    if settings.LOG_FILE:
        log_dir = os.path.dirname(settings.LOG_FILE)
        if log_dir:
            os.makedirs(log_dir, exist_ok=True)

    dictConfig({
        "version": 1,
        "disable_existing_loggers": False,  # לא לשבור uvicorn/sqlalchemy
        "filters": {
            "request_id": {"()": RequestIdFilter},
        },
        "formatters": {
            "plain": {"format": PLAIN_FMT, "datefmt": PLAIN_DATEFMT},
            "json": {"()": JsonFormatter},
        },
        "handlers": _handlers(),
        "loggers": {
            # הלוגרים של האפליקציה
            "app": {
                "level": settings.LOG_LEVEL,
                "handlers": ["console", *(["file"] if settings.LOG_FILE else [])],
                "propagate": False,
            },

            # החזרת ה-banner/Startup של uvicorn למסך
            "uvicorn": {"level": "INFO", "handlers": ["console"], "propagate": False},
            "uvicorn.error": {"level": "INFO", "handlers": ["console"], "propagate": False},

            # שקט ל-access (יש לך access-logs משלך במידלוור)
            "uvicorn.access": {"level": "WARNING", "propagate": False},

            # פחות רעש מ-SQLAlchemy כברירת מחדל
            "sqlalchemy.engine": {"level": "WARNING", "propagate": True},
        },
        "root": {
            "level": settings.LOG_LEVEL,
            "handlers": ["console", *(["file"] if settings.LOG_FILE else [])],
        },
    })
