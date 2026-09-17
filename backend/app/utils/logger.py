"""Structured logging configuration for CardioLens CDSS.

Application logs are written to rotating files under backend/logs/:
  - app.log       all INFO+ events
  - errors.log    ERROR+ only
  - training.log  training pipeline events
"""

import logging
import sys
from logging.handlers import RotatingFileHandler
from pathlib import Path
from typing import Optional


LOG_DIR = Path(__file__).resolve().parent.parent.parent / "logs"
LOG_DIR.mkdir(parents=True, exist_ok=True)

LOG_FORMAT = "%(asctime)s | %(levelname)-8s | %(name)s:%(lineno)d | %(message)s"
DATE_FORMAT = "%Y-%m-%d %H:%M:%S"
LOG_LEVEL = logging.INFO

_ROOT_CONFIGURED = False


def _build_formatter() -> logging.Formatter:
    return logging.Formatter(fmt=LOG_FORMAT, datefmt=DATE_FORMAT)


def _rotating_handler(filename: str, max_bytes: int, backups: int, level: int) -> RotatingFileHandler:
    handler = RotatingFileHandler(
        LOG_DIR / filename,
        maxBytes=max_bytes,
        backupCount=backups,
        encoding="utf-8",
    )
    handler.setLevel(level)
    handler.setFormatter(_build_formatter())
    return handler


def configure_root_logging() -> Path:
    """Attach console + file handlers to the root logger once.

    Creates the log files on first call so backend/logs/ is never empty
    after the API process starts.
    """
    global _ROOT_CONFIGURED
    LOG_DIR.mkdir(parents=True, exist_ok=True)

    # Windows consoles default to cp1252 and cannot encode UTF-8 characters
    # (e.g. '->' glyphs); relax them so logging never crashes the process.
    for stream in (sys.stdout, sys.stderr):
        try:
            if hasattr(stream, "reconfigure"):
                stream.reconfigure(encoding="utf-8", errors="replace")
        except Exception:
            pass

    if _ROOT_CONFIGURED:
        return LOG_DIR

    root = logging.getLogger()
    root.setLevel(LOG_LEVEL)

    formatter = _build_formatter()

    if not any(isinstance(h, logging.StreamHandler) and not isinstance(h, RotatingFileHandler) for h in root.handlers):
        console = logging.StreamHandler(sys.stdout)
        console.setLevel(LOG_LEVEL)
        console.setFormatter(formatter)
        root.addHandler(console)

    has_app_file = any(
        isinstance(h, RotatingFileHandler) and Path(getattr(h, "baseFilename", "")).name == "app.log"
        for h in root.handlers
    )
    if not has_app_file:
        root.addHandler(_rotating_handler("app.log", 10 * 1024 * 1024, 5, LOG_LEVEL))
        root.addHandler(_rotating_handler("errors.log", 5 * 1024 * 1024, 3, logging.ERROR))

    _ROOT_CONFIGURED = True
    logging.getLogger("cardiolens").info("File logging initialized at %s", LOG_DIR.resolve())
    return LOG_DIR


def get_logger(name: str, extra_file: Optional[str] = None) -> logging.Logger:
    """Returns a named logger that inherits root file handlers.

    Args:
        name: Module or component name (e.g. 'cardiolens.training').
        extra_file: Optional extra rotating log filename under backend/logs/.
    """
    configure_root_logging()
    logger = logging.getLogger(name)
    logger.setLevel(LOG_LEVEL)

    if extra_file:
        already = any(
            isinstance(h, RotatingFileHandler) and Path(getattr(h, "baseFilename", "")).name == extra_file
            for h in logger.handlers
        )
        if not already:
            logger.addHandler(_rotating_handler(extra_file, 10 * 1024 * 1024, 5, LOG_LEVEL))

    return logger


def describe_log_storage() -> dict:
    """Runtime snapshot of log directory and files on disk."""
    configure_root_logging()
    files = []
    for path in sorted(LOG_DIR.glob("*")):
        if path.is_file() and path.name != ".gitkeep":
            files.append(
                {
                    "name": path.name,
                    "path": str(path.resolve()),
                    "size_bytes": path.stat().st_size,
                }
            )
    return {
        "directory": str(LOG_DIR.resolve()),
        "files": files,
        "note": (
            "Application events write to app.log. Errors also go to errors.log. "
            "Training runs append to training.log. Prediction audit rows live in the database, not these files."
        ),
    }


logger = get_logger("cardiolens")
