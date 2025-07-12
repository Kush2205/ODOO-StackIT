from fastapi import APIRouter, Depends, HTTPException
from deps import get_current_user
from models import Question
from database import db
from bson import ObjectId
from datetime import datetime
from pydantic import BaseModel

router = APIRouter()

class VoteRequest(BaseModel):
    direction: str

def serialize_question(q):
    q["_id"] = str(q["_id"])
    # Fetch user information
    if "user_id" in q:
        try:
            # Try to convert user_id to ObjectId
            user_object_id = ObjectId(q["user_id"])
            user = db.users.find_one({"_id": user_object_id})
            if user:
                q["author"] = user["username"]
                q["author_avatar"] = user["username"][:2].upper()
            else:
                q["author"] = "Unknown User"
                q["author_avatar"] = "U"
        except Exception:
            # Handle invalid ObjectId (legacy data)
            print(f"Warning: Invalid user_id '{q['user_id']}' for question {q['_id']}")
            q["author"] = "Legacy User"
            q["author_avatar"] = "LU"
    else:
        q["author"] = "Anonymous"
        q["author_avatar"] = "A"
    
    # Count answers for this question
    answer_count = db.answers.count_documents({"question_id": str(q["_id"])})
    q["answer_count"] = answer_count
    
    # Ensure tags field exists
    if "tags" not in q:
        q["tags"] = []
    
    return q

@router.post("/questions")
def ask_question(question: Question, user = Depends(get_current_user)):
    question_data = question.dict()
    question_data["user_id"] = user["user_id"]
    question_data["username"] = user["username"]
    question_data["created_at"] = datetime.utcnow()
    question_data["updated_at"] = datetime.utcnow()
    question_data["accepted_answer_id"] = None
    question_data["votes"] = 0
    question_data["voters"] = {}
    result = db.questions.insert_one(question_data)
    return {"message": "Question posted", "id": str(result.inserted_id)}

@router.get("/questions")
def get_all_questions():
    questions = list(db.questions.find())
    return [serialize_question(q) for q in questions]

@router.get("/questions/{id}")
def get_question(id: str):
    try:
        question = db.questions.find_one({"_id": ObjectId(id)})
        if not question:
            raise HTTPException(status_code=404, detail="Question not found")
        return serialize_question(question)
    except Exception as e:
        print(f"Error getting question {id}: {e}")
        raise HTTPException(status_code=400, detail="Invalid question ID")

@router.post("/questions/{qid}/vote")
def vote_question(qid: str, vote_request: VoteRequest, user=Depends(get_current_user)):
    direction = vote_request.direction
    if direction not in ["up", "down"]:
        raise HTTPException(status_code=400, detail="Direction must be 'up' or 'down'")

    try:
        question = db.questions.find_one({"_id": ObjectId(qid)})
        if not question:
            raise HTTPException(status_code=404, detail="Question not found")

        user_id = user["user_id"]
        voters = question.get("voters", {})

        previous_vote = voters.get(user_id)

        if previous_vote == direction:
            raise HTTPException(
                status_code=400, detail=f"You already {direction}voted this question"
            )

        vote_change = 0
        if previous_vote == "up" and direction == "down":
            vote_change = -2  # reversing upvote (+1 → -1)
        elif previous_vote == "down" and direction == "up":
            vote_change = 2  # reversing downvote (-1 → +1)
        elif previous_vote is None:
            vote_change = 1 if direction == "up" else -1

        db.questions.update_one(
            {"_id": ObjectId(qid)},
            {"$inc": {"votes": vote_change}, "$set": {f"voters.{user_id}": direction}},
        )

        return {"message": f"Vote updated to {direction}"}
    except Exception as e:
        print(f"Error voting on question {qid}: {e}")
        raise HTTPException(status_code=400, detail="Invalid question ID or voting error")
