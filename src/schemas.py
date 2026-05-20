from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from enum import Enum


class CategoryEnum(str, Enum):
    study = "study"
    work = "work"
    personal = "personal"


class PriorityEnum(str, Enum):
    high = "high"
    medium = "medium"
    low = "low"


class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    deadline: Optional[datetime] = None
    category: CategoryEnum = CategoryEnum.personal
    priority: PriorityEnum = PriorityEnum.medium


class TaskUpdate(BaseModel):
    is_done: bool


class TaskResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    deadline: Optional[datetime]
    category: str
    priority: str
    is_done: bool
    created_at: datetime

    class Config:
        from_attributes = True
