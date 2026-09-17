"""Runtime system information: log storage and artifact paths."""

from fastapi import APIRouter, status

from app.services.benchmark_service import resolve_artifacts_dir
from app.utils.logger import describe_log_storage

router = APIRouter()


@router.get(
    "/system/logs",
    status_code=status.HTTP_200_OK,
    summary="Where application log files are stored",
)
def get_log_storage() -> dict:
    payload = describe_log_storage()
    payload["model_artifacts_directory"] = str(resolve_artifacts_dir().resolve())
    payload["audit_store"] = (
        "Patient assessment history is stored in the SQL table prediction_logs, not in log files."
    )
    return payload
