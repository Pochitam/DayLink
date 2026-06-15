from src.schemas import TaskCreate, CategoryEnum, PriorityEnum
from datetime import datetime


def test_task_create_defaults():
    task = TaskCreate(title="Купить кофе")
    assert task.title == "Купить кофе"
    assert task.category == CategoryEnum.personal
    assert task.priority == PriorityEnum.medium
    assert task.description is None
    assert task.deadline is None


def test_task_create_with_all_fields():
    task = TaskCreate(
        title="Сдать ДЗ",
        description="Не забыть",
        deadline=datetime(2026, 12, 31, 23, 59),
        category=CategoryEnum.study,
        priority=PriorityEnum.high,
    )
    assert task.title == "Сдать ДЗ"
    assert task.category == CategoryEnum.study
    assert task.priority == PriorityEnum.high


def test_task_title_cannot_be_empty():
    try:
        TaskCreate(title="")
        assert False, "должна быть ошибка"
    except Exception:
        pass