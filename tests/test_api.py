import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from src.main import app
from src.database import Base, get_db

# Тестовая база — отдельная от основной
TEST_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


client = TestClient(app)


def test_get_tasks_empty():
    response = client.get("/tasks/")
    assert response.status_code == 200
    assert response.json() == []


def test_create_task():
    response = client.post("/tasks/", json={
        "title": "Тестовая задача",
        "category": "study",
        "priority": "high",
    })
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Тестовая задача"
    assert data["category"] == "study"
    assert data["priority"] == "high"
    assert data["is_done"] is False


def test_create_and_get_task():
    client.post("/tasks/", json={"title": "Задача 1", "category": "work", "priority": "low"})
    response = client.get("/tasks/")
    assert response.status_code == 200
    assert len(response.json()) == 1


def test_mark_task_done():
    create = client.post("/tasks/", json={"title": "Сделать", "category": "personal", "priority": "medium"})
    task_id = create.json()["id"]
    response = client.patch(f"/tasks/{task_id}/done")
    assert response.status_code == 200
    assert response.json()["is_done"] is True


def test_delete_task():
    create = client.post("/tasks/", json={"title": "Удалить меня", "category": "work", "priority": "low"})
    task_id = create.json()["id"]
    client.delete(f"/tasks/{task_id}")
    response = client.get("/tasks/")
    assert response.json() == []


def test_delete_nonexistent_task():
    response = client.delete("/tasks/999")
    assert response.status_code == 404


def test_mark_nonexistent_task_done():
    response = client.patch("/tasks/999/done")
    assert response.status_code == 404