from fastapi import APIRouter, Depends
from database import db
from bson import ObjectId
from deps import get_current_admin

router = APIRouter()

@router.delete("/questions/{qid}")
def delete_question(qid: str, admin=Depends(get_current_admin)):
    db.questions.delete_one({"_id": ObjectId(qid)})
    db.answers.delete_many({"question_id": qid})
    return {"message": "Question and its answers deleted"}

@router.delete("/answers/{aid}")
def delete_answer(aid: str, admin=Depends(get_current_admin)):
    db.answers.delete_one({"_id": ObjectId(aid)})
    return {"message": "Answer deleted"}

