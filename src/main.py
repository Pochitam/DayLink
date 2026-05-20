from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from .database import engine, Base
from .routers import tasks
import os

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Daylink")

app.mount("/static", StaticFiles(directory="src/static"), name="static")

app.include_router(tasks.router)

@app.get("/")
def read_root():
    return FileResponse("src/static/index.html")