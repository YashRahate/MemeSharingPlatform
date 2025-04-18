# backend/models/comment.py
from datetime import datetime
from bson import ObjectId

class Comment:
    def __init__(self, meme_id, user_id, text):
        self.meme_id = meme_id
        self.user_id = user_id
        self.text = text
        self.created_at = datetime.utcnow()

    def to_dict(self):
        return {
            "meme_id": str(self.meme_id),
            "user_id": str(self.user_id),
            "text": self.text,
            "created_at": self.created_at
        }