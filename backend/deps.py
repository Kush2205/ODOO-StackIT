from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from auth import decode_access_token
from database import db
from bson import ObjectId

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = decode_access_token(token)
        user = db.users.find_one({"_id": ObjectId(payload["user_id"])})
        if not user:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        return {"user_id": str(user["_id"]), "username": user["username"]}
    except:
        raise HTTPException(status_code=401, detail="Invalid token")
