from datetime import datetime
from bson import ObjectId
from flask import current_app, g
from services.mongodb_service import get_db

class Meme:
    def __init__(self, user_id, image_url, caption="", tags=None, cloudinary_public_id=None):
        self.user_id = user_id
        self.image_url = image_url
        self.caption = caption
        self.tags = tags or []
        self.cloudinary_public_id = cloudinary_public_id
        self.likes = []
        self.comments = []
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()

    def to_dict(self):
        return {
            "user_id": str(self.user_id) if isinstance(self.user_id, ObjectId) else self.user_id,
            "image_url": self.image_url,
            "caption": self.caption,
            "tags": self.tags,
            "cloudinary_public_id": self.cloudinary_public_id,
            "likes": [str(like) for like in self.likes],
            "comments": self.comments,
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }
    
    @staticmethod
    def get_feed_for_user(user_id, limit=10, skip=0):
        """
        Get a personalized feed of memes for a user.
        This includes memes from users they follow and possibly popular memes.
        """
        from models.user import User  # Import here to avoid circular imports
        
        # Convert string ID to ObjectId if necessary
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
            
        # Get list of users that the current user follows
        following_ids = User.get_following_ids(user_id)
        
        # Log for debugging
        print(f"Found {len(following_ids)} following IDs: {following_ids}")
        
        # Get MongoDB connection
        db = get_db()
        
        # Query for memes from followed users and the user's own memes
        query = {
            "$or": [
                {"user_id": {"$in": following_ids}},  # Memes from followed users
                {"user_id": user_id}                 # User's own memes
            ]
        }
        
        # Log for debugging
        print(f"Executing meme query: {query}")
        
        # Get memes, sort by creation date (newest first)
        memes = list(db.memes.find(query)
                    .sort("created_at", -1)
                    .skip(skip)
                    .limit(limit))
        
        # Log for debugging
        print(f"Found {len(memes)} memes for feed")
        
        # Enrich memes with user info and comment info
        for meme in memes:
            # Add user info
            meme_user = User.find_by_id(str(meme['user_id']))
            if meme_user:
                meme['user'] = {
                    '_id': meme_user['_id'],
                    'username': meme_user['username'],
                    'profile_pic': meme_user.get('profile_pic')
                }
            
            # Add if the current user has liked this meme
            meme['is_liked'] = user_id in [ObjectId(like_id) if isinstance(like_id, str) else like_id for like_id in meme.get('likes', [])]
            
            # Get recent comments
            recent_comments = list(db.comments.find({'meme_id': meme['_id']})
                                .sort('created_at', -1)
                                .limit(3))
            
            # Add user info to comments
            for comment in recent_comments:
                comment_user = User.find_by_id(str(comment['user_id']))
                if comment_user:
                    comment['user'] = {
                        '_id': comment_user['_id'],
                        'username': comment_user['username'],
                        'profile_pic': comment_user.get('profile_pic')
                    }
            
            meme['recent_comments'] = recent_comments
            meme['comments_count'] = db.comments.count_documents({'meme_id': meme['_id']})
            meme['likes_count'] = len(meme.get('likes', []))
        
        return memes
        
    @staticmethod
    def create(user_id, image_url, caption="", tags=None, cloudinary_public_id=None):
        # Convert string ID to ObjectId if necessary
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
            
        # Create meme document
        meme_data = {
            "user_id": user_id,
            "image_url": image_url,
            "caption": caption,
            "tags": tags or [],
            "cloudinary_public_id": cloudinary_public_id,
            "likes": [],
            "comments": [],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        # Get MongoDB connection
        db = get_db()
        
        # Insert into MongoDB
        result = db.memes.insert_one(meme_data)
        
        # Add the ID to the data
        meme_data["_id"] = result.inserted_id
        
        return meme_data
    
    @staticmethod
    def find_by_id(meme_id):
        """
        Find a meme by its ID.
        
        Args:
            meme_id (str): The ID of the meme to find
            
        Returns:
            dict: The meme document or None if not found
        """
        if isinstance(meme_id, str):
            meme_id = ObjectId(meme_id)
            
        db = get_db()
        return db.memes.find_one({"_id": meme_id})

    @staticmethod
    def like(meme_id, user_id):
        """
        Add a like to a meme.
        
        Args:
            meme_id (str): The ID of the meme to like
            user_id (str): The ID of the user liking the meme
            
        Returns:
            bool: True if the meme was successfully liked, False if already liked
        """
        print(f"Attempting to like: meme_id={meme_id}, user_id={user_id}")
        if isinstance(meme_id, str):
            meme_id = ObjectId(meme_id)
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
            
        db = get_db()
        print(f"Database connected: {db is not None}")

        meme_exists = db.memes.find_one({"_id": meme_id})
        print(f"Meme exists: {meme_exists is not None}")
        
        # Check if already liked
        meme = db.memes.find_one({
            "_id": meme_id,
            "likes": user_id
        })
        
        if meme:
            return False  # Already liked
        
        # Add like
        result = db.memes.update_one(
            {"_id": meme_id},
            {"$addToSet": {"likes": user_id}}
        )
        
        return result.modified_count > 0

    @staticmethod
    def unlike(meme_id, user_id):
        """
        Remove a like from a meme.
        
        Args:
            meme_id (str): The ID of the meme to unlike
            user_id (str): The ID of the user unliking the meme
            
        Returns:
            bool: True if the meme was successfully unliked, False if not previously liked
        """
        if isinstance(meme_id, str):
            meme_id = ObjectId(meme_id)
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
            
        db = get_db()
        
        # Remove like
        result = db.memes.update_one(
            {"_id": meme_id},
            {"$pull": {"likes": user_id}}
        )
        
        return result.modified_count > 0
        
    @staticmethod
    def add_comment(meme_id, user_id, text):
        """
        Add a comment to a meme
        
        Args:
            meme_id (str): ID of the meme to comment on
            user_id (str): ID of the user making the comment
            text (str): Comment text
            
        Returns:
            dict: The created comment object
        """
        db = get_db()
        
        # Convert string IDs to ObjectId if needed
        if not isinstance(meme_id, ObjectId):
            meme_id = ObjectId(meme_id)
        if not isinstance(user_id, ObjectId):
            user_id = ObjectId(user_id)
        
        # Create comment object
        comment = {
            "_id": ObjectId(),
            "meme_id": meme_id,
            "user_id": user_id,
            "text": text,
            "created_at": datetime.utcnow()
        }
        
        # Add comment to meme
        db.memes.update_one(
            {"_id": meme_id},
            {"$push": {"comments": comment}}
        )
        
        # Get user info for the comment
        from models.user import User
        user = User.get_by_id(user_id)
        if user:
            # Add user info to the returned comment
            comment["user"] = {
                "_id": user["_id"],
                "username": user["username"],
                "profile_picture": user.get("profile_picture")
            }
        
        # Convert ObjectIds to strings for JSON serialization
        comment["_id"] = str(comment["_id"])
        comment["meme_id"] = str(comment["meme_id"])
        comment["user_id"] = str(comment["user_id"])
        # Convert datetime to ISO format string
        comment["created_at"] = comment["created_at"].isoformat()
        
        if "user" in comment and comment["user"]:
            comment["user"]["_id"] = str(comment["user"]["_id"])
        
        return comment
    
    @staticmethod
    def get_comments(meme_id, limit=10, skip=0):
        """
        Get comments for a specific meme
        
        Args:
            meme_id (str): ID of the meme
            limit (int): Maximum number of comments to return
            skip (int): Number of comments to skip (for pagination)
            
        Returns:
            list: List of comment objects
        """
        db = get_db()
        
        # Convert string ID to ObjectId if needed
        if not isinstance(meme_id, ObjectId):
            meme_id = ObjectId(meme_id)
        
        # Find the meme
        meme = db.memes.find_one({"_id": meme_id})
        
        if not meme or "comments" not in meme:
            return []
        
        # Sort comments by creation date (newest first) and apply pagination
        comments = sorted(
            meme["comments"], 
            key=lambda x: x.get("created_at", datetime.min), 
            reverse=True
        )[skip:skip+limit]
        
        # Get user information for each comment
        from models.user import User
        for comment in comments:
            user_id = comment.get("user_id")
            if user_id:
                user = User.get_by_id(user_id)
                if user:
                    comment["user"] = {
                        "_id": user["_id"],
                        "username": user["username"],
                        "profile_picture": user.get("profile_picture")
                    }
            
            # Convert ObjectIds to strings for JSON serialization
            comment["_id"] = str(comment["_id"])
            comment["meme_id"] = str(comment["meme_id"])
            comment["user_id"] = str(comment["user_id"])
            comment["created_at"] = comment["created_at"].isoformat() if isinstance(comment["created_at"], datetime) else comment["created_at"]
            
            if "user" in comment and comment["user"]:
                comment["user"]["_id"] = str(comment["user"]["_id"])
        
        return comments
    
    @staticmethod
    def delete_comment(comment_id, user_id):
        """
        Delete a comment from a meme
        
        Args:
            comment_id (str): ID of the comment to delete
            user_id (str): ID of the user attempting to delete
            
        Returns:
            bool: True if deletion was successful, False otherwise
        """
        db = get_db()
        
        # Convert string IDs to ObjectId if needed
        if not isinstance(comment_id, ObjectId):
            comment_id = ObjectId(comment_id)
        if not isinstance(user_id, ObjectId):
            user_id = ObjectId(user_id)
        
        # Find and remove the comment
        result = db.memes.update_one(
            {
                "comments": {
                    "$elemMatch": {
                        "_id": comment_id,
                        "user_id": user_id  # Ensure the user owns this comment
                    }
                }
            },
            {
                "$pull": {
                    "comments": {
                        "_id": comment_id
                    }
                }
            }
        )
        
        # Return True if the comment was found and deleted
        return result.modified_count > 0