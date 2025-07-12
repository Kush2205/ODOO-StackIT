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

class UserLogin(BaseModel):
    email: EmailStr
    password: str
