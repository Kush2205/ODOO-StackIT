import re
from fastapi import APIRouter, HTTPException, Depends
from models import Answer
from database import db
from bson import ObjectId
from datetime import datetime
from deps import get_current_user

router = APIRouter()


def serialize_answer(ans):
    ans["_id"] = str(ans["_id"])
    # Fetch user information
    if "user_id" in ans:
        try:
            # Try to convert user_id to ObjectId
            user_object_id = ObjectId(ans["user_id"])
            user = db.users.find_one({"_id": user_object_id})
            if user:
                ans["author"] = user["username"]
                ans["author_avatar"] = user["username"][:2].upper()
            else:
                ans["author"] = "Unknown User"
                ans["author_avatar"] = "U"
        except Exception:
            # Handle invalid ObjectId (legacy data)
            print(f"Warning: Invalid user_id '{ans['user_id']}' for answer {ans['_id']}")
            ans["author"] = "Legacy User"
            ans["author_avatar"] = "LU"
    else:
        ans["author"] = "Anonymous"
        ans["author_avatar"] = "A"
    return ans


@router.post("/answers/{aid}/vote")
def vote_answer(aid: str, direction: str, user=Depends(get_current_user)):
    if direction not in ["up", "down"]:
        raise HTTPException(status_code=400, detail="Direction must be 'up' or 'down'")

    try:
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
    except Exception as e:
        print(f"Error voting on answer {aid}: {e}")
        raise HTTPException(status_code=400, detail="Invalid answer ID or voting error")


@router.post("/answers/{aid}/accept")
def accept_answer(aid: str, user=Depends(get_current_user)):
    try:
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
    except Exception as e:
        print(f"Error accepting answer {aid}: {e}")
        raise HTTPException(status_code=400, detail="Invalid answer ID or acceptance error")


@router.post("/questions/{qid}/answers")
def post_answer(qid: str, answer: Answer, user=Depends(get_current_user)):
    try:
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

        question = db.questions.find_one({"_id": ObjectId(qid)})

        if question and question["user_id"] != user["user_id"]:
            notification = {
                "user_id": question["user_id"],
                "message": f"{user['username']} answered your question: {question['title']}",
                "link": f"/questions/{qid}",
                "read": False,
                "created_at": datetime.utcnow(),
            }
            db.notifications.insert_one(notification)

        # Detect mentions in content (e.g., "@alice")
        mention_pattern = r"@(\w+)"
        mentioned_usernames = re.findall(mention_pattern, answer_data["content"])

        for uname in mentioned_usernames:
            mentioned_user = db.users.find_one({"username": uname})
            if mentioned_user and str(mentioned_user["_id"]) != user["user_id"]:
                db.notifications.insert_one(
                    {
                        "user_id": str(mentioned_user["_id"]),
                        "message": f"{user['username']} mentioned you in an answer",
                        "link": f"/questions/{qid}",
                        "read": False,
                        "created_at": datetime.utcnow(),
                    }
                )

        return {"message": "Answer posted"}
    except Exception as e:
        print(f"Error posting answer to question {qid}: {e}")
        raise HTTPException(status_code=400, detail="Invalid question ID or posting error")


@router.get("/questions/{qid}/answers")
def get_answers(qid: str):
    answers = list(db.answers.find({"question_id": qid}))
    return [serialize_answer(a) for a in answers]
