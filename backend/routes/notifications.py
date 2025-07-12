from fastapi import APIRouter, Depends, Query
from bson import ObjectId
from datetime import datetime
import re

from database import db
from deps import get_current_user

router = APIRouter()

# Get notifications (with optional filter)
@router.get("/notifications")
def get_notifications(user=Depends(get_current_user), unread_only: bool = Query(False)):
    query = {"user_id": user["user_id"]}
    if unread_only:
        query["read"] = False

    notifs = list(db.notifications.find(query).sort("created_at", -1))
    for n in notifs:
        n["_id"] = str(n["_id"])
    return notifs

# Get count of unread notifications
@router.get("/notifications/count")
def get_notification_count(user=Depends(get_current_user)):
    count = db.notifications.count_documents({
        "user_id": user["user_id"],
        "read": False
    })
    return {"unread_count": count}

# Mark all as read
@router.post("/notifications/mark-read")
def mark_read(user=Depends(get_current_user)):
    db.notifications.update_many(
        {"user_id": user["user_id"], "read": False},
        {"$set": {"read": True}}
    )
    return {"message": "All notifications marked as read"}
