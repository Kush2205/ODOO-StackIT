from fastapi import APIRouter, HTTPException
from models import Answer
from database import db
from bson import ObjectId
from datetime import datetime

router = APIRouter()

def serialize_answer(ans):
    ans["_id"] = str(ans["_id"])
    return ans

@router.post("/questions/{qid}/answers")
def post_answer(qid: str, answer: Answer):
    if not db.questions.find_one({"_id": ObjectId(qid)}):
        raise HTTPException(status_code=404, detail="Question not found")

    answer_data = answer.dict()
    answer_data["question_id"] = qid 
    answer_data["created_at"] = datetime.utcnow()
    db.answers.insert_one(answer_data)
    return {"message": "Answer posted"}

@router.get("/questions/{qid}/answers")
def get_answers(qid: str):
    answers = list(db.answers.find({"question_id": qid}))
    return [serialize_answer(a) for a in answers]



