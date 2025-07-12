from pydantic import BaseModel, EmailStr
from typing import List, Optional

class Question(BaseModel):
    title: str
    description: str
    tags: List[str] = []

class Answer(BaseModel):
    content: str
    
class UserRegister(BaseModel):
    username: str
    email: EmailStr
    password: str
    is_admin: bool

class UserLogin(BaseModel):
    email: EmailStr
    password: str
    
class Vote(BaseModel):
    direction: str
