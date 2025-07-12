from datetime import datetime
from fastapi import APIRouter, HTTPException
from models import UserRegister, UserLogin
from auth import hash_password, verify_password, create_access_token
from database import db

router = APIRouter()

@router.post("/register")
def register(user: UserRegister):
    if db.users.find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_pw = hash_password(user.password)
    db.users.insert_one({
        "username": user.username,
        "email": user.email,
        "password": hashed_pw,
        "created_at": datetime.utcnow()
    })
    return {"message": "User registered successfully"}

@router.post("/login")
def login(user: UserLogin):
    db_user = db.users.find_one({"email": user.email})
    if not db_user or not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    token = create_access_token({"user_id": str(db_user["_id"]), "username": db_user["username"]})
    return {"access_token": token, "token_type": "bearer"}
