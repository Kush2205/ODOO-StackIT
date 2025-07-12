from fastapi import APIRouter, Depends
from database import db
from bson import ObjectId
from deps import get_current_admin, get_current_user
from datetime import datetime

router = APIRouter()

@router.post("/questions/{qid}/flag")
def flag_question(qid: str, user=Depends(get_current_user)):
    db.flags.insert_one({
        "type": "question",
        "item_id": qid,
        "flagged_by": user["user_id"],
        "created_at": datetime.utcnow()
    })
    return {"message": "Question flagged"}

@router.post("/answers/{aid}/flag")
def flag_answer(aid: str, user=Depends(get_current_user)):
    db.flags.insert_one({
        "type": "answer",
        "item_id": aid,
        "flagged_by": user["user_id"],
        "created_at": datetime.utcnow()
    })
    return {"message": "Answer flagged"}

@router.get("/admin/flags")
def get_flags(admin=Depends(get_current_admin)):
    flags = list(db.flags.find().sort("created_at", -1))
    for f in flags:
        f["_id"] = str(f["_id"])
    return flags
