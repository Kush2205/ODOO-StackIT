from fastapi import APIRouter, HTTPException
from models import Question
from database import db
from bson import ObjectId
from datetime import datetime

router = APIRouter()

def serialize_question(q):
    q["_id"] = str(q["_id"])
    return q

@router.post("/questions")
def ask_question(question: Question):
    question_data = question.dict()
    question_data["created_at"] = datetime.utcnow()
    question_data["votes"] = 0
    question_data["accepted_answer_id"] = None
    result = db.questions.insert_one(question_data)
    return {"message": "Question posted", "id": str(result.inserted_id)}

@router.get("/questions")
def get_all_questions():
    questions = list(db.questions.find())
    return [serialize_question(q) for q in questions]

@router.get("/questions/{id}")
def get_question(id: str):
    question = db.questions.find_one({"_id": ObjectId(id)})
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    return serialize_question(question)
