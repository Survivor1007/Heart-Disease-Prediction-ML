# Application logs

This directory is created automatically when the API starts.

| File | Contents |
| --- | --- |
| `app.log` | All INFO+ application events (rotates at 10 MB, 5 backups) |
| `errors.log` | ERROR+ only (rotates at 5 MB, 3 backups) |
| `training.log` | Model training pipeline events |

Log files are gitignored. Prediction **audit history** (patient assessments) is stored in the SQL database (`prediction_logs`), not here.

Query `GET /api/v1/system/logs` for the resolved path on the running server.
