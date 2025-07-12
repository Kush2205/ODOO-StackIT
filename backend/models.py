from pydantic import BaseModel
from typing import Optional

class Question(BaseModel):
    title: str
    description: str
    user_id: str 

class Answer(BaseModel):
    question_id: str
    content: str
    user_id: str  
