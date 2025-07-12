from fastapi import APIRouter, HTTPException, Depends
from models import Answer
from database import db
from bson import ObjectId
from datetime import datetime
from deps import get_current_user

router = APIRouter()


def serialize_answer(ans):
    ans["_id"] = str(ans["_id"])
    return ans


@router.post("/answers/{aid}/vote")
def vote_answer(aid: str, direction: str, user=Depends(get_current_user)):
    if direction not in ["up", "down"]:
        raise HTTPException(status_code=400, detail="Direction must be 'up' or 'down'")

    answer = db.answers.find_one({"_id": ObjectId(aid)})
    if not answer:
        raise HTTPException(status_code=404, detail="Answer not found")

    user_id = user["user_id"]
    voters = answer.get("voters", {})

    previous_vote = voters.get(user_id)

    if previous_vote == direction:
        raise HTTPException(
            status_code=400, detail=f"You already {direction}voted this answer"
        )

    vote_change = 0
    if previous_vote == "up" and direction == "down":
        vote_change = -2  # reversing upvote (+1 → -1)

    elif previous_vote == "down" and direction == "up":
        vote_change = 2  # reversing downvote (-1 → +1)

    elif previous_vote is None:
        vote_change = 1 if direction == "up" else -1

    db.answers.update_one(
        {"_id": ObjectId(aid)},
        {"$inc": {"votes": vote_change}, "$set": {f"voters.{user_id}": direction}},
    )

    return {"message": f"Vote updated to {direction}"}


@router.post("/answers/{aid}/accept")
def accept_answer(aid: str, user=Depends(get_current_user)):
    answer = db.answers.find_one({"_id": ObjectId(aid)})
    if not answer:
        raise HTTPException(status_code=404, detail="Answer not found")

    question = db.questions.find_one({"_id": ObjectId(answer["question_id"])})
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    if question["user_id"] != user["user_id"]:
        raise HTTPException(
            status_code=403, detail="Only the question author can accept an answer"
        )

    # Set accepted answer on question
    db.questions.update_one(
        {"_id": ObjectId(answer["question_id"])},
        {"$set": {"accepted_answer_id": str(aid)}},
    )
    # Mark answer as accepted
    db.answers.update_one({"_id": ObjectId(aid)}, {"$set": {"is_accepted": True}})

    return {"message": "Answer marked as accepted"}


@router.post("/questions/{qid}/answers")
def post_answer(qid: str, answer: Answer, user=Depends(get_current_user)):
    if not db.questions.find_one({"_id": ObjectId(qid)}):
        raise HTTPException(status_code=404, detail="Question not found")

    answer_data = {
        "question_id": qid,
        "content": answer.content,
        "user_id": user["user_id"],
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "is_accepted": False,
        "votes": 0,
        "voters": [],
    }

    db.answers.insert_one(answer_data)
    return {"message": "Answer posted"}


@router.get("/questions/{qid}/answers")
def get_answers(qid: str):
    answers = list(db.answers.find({"question_id": qid}))
    return [serialize_answer(a) for a in answers]
