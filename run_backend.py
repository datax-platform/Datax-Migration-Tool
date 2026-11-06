import uvicorn
import os
import sys

if __name__ == "__main__":
    reload_flag = os.getenv("UVICORN_RELOAD", "true").lower() in ("true", "1")
    uvicorn.run("server.main:app", host="0.0.0.0", port=8000, reload=reload_flag)
