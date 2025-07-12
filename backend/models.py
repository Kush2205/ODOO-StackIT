from pydantic import BaseModel, EmailStr

class Question(BaseModel):
    title: str
    description: str

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
