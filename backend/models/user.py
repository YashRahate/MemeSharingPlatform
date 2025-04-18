import datetime
from bson import ObjectId
from services.mongodb_service import get_db
from utils.auth_utils import hash_password

class User:
    @staticmethod
    def create(username, email, password):
        """
        Create a new user.
        
        Args:
            username (str): The username
            email (str): The email address
            password (str): The plain text password
            
        Returns:
            dict: The created user document
        """
        user = {
            'username': username,
            'email': email,
            'password': hash_password(password),
            'profile_pic': None,
            'bio': '',
            'created_at': datetime.datetime.utcnow(),
            'updated_at': datetime.datetime.utcnow()
        }
        
        db = get_db()
        result = db.users.insert_one(user)
        user['_id'] = result.inserted_id
        del user['password']  # Don't return the password
        
        return user
    
    @staticmethod
    def find_by_id(user_id):
        """
        Find a user by ID.
        
        Args:
            user_id (str): The user ID
            
        Returns:
            dict: The user document (without password)
        """
        db = get_db()
        user = db.users.find_one({'_id': ObjectId(user_id)})
        if user:
            del user['password']
        return user
    
    @staticmethod
    def find_by_email(email):
        """
        Find a user by email.
        
        Args:
            email (str): The email address
            
        Returns:
            dict: The user document (with password for auth)
        """
        db = get_db()
        return db.users.find_one({'email': email})
    
    @staticmethod
    def find_by_username(username):
        """
        Find a user by username.
        
        Args:
            username (str): The username
            
        Returns:
            dict: The user document (without password)
        """
        db = get_db()
        user = db.users.find_one({'username': username})
        if user:
            del user['password']
        return user
    
    @staticmethod
    def search(query, limit=10, skip=0):
        """
        Search users by username or email.
        
        Args:
            query (str): The search query
            limit (int): Maximum number of results
            skip (int): Number of results to skip
            
        Returns:
            list: List of matching user documents (without passwords)
        """
        db = get_db()
        users = list(db.users.find({
            '$or': [
                {'username': {'$regex': query, '$options': 'i'}},
                {'email': {'$regex': query, '$options': 'i'}}
            ]
        }, {'password': 0}).skip(skip).limit(limit))
        
        return users
    
    @staticmethod
    def follow(follower_id, following_id):
        """
        Follow a user.
        
        Args:
            follower_id (str): The ID of the follower
            following_id (str): The ID of the user to follow
            
        Returns:
            bool: True if successful
        """
        db = get_db()
        try:
            db.follows.insert_one({
                'follower_id': ObjectId(follower_id),
                'following_id': ObjectId(following_id),
                'created_at': datetime.datetime.utcnow()
            })
            return True
        except:
            return False
    
    @staticmethod
    def unfollow(follower_id, following_id):
        """
        Unfollow a user.
        
        Args:
            follower_id (str): The ID of the follower
            following_id (str): The ID of the user to unfollow
            
        Returns:
            bool: True if successful
        """
        db = get_db()
        result = db.follows.delete_one({
            'follower_id': ObjectId(follower_id),
            'following_id': ObjectId(following_id)
        })
        return result.deleted_count > 0
    
    @staticmethod
    def is_following(follower_id, following_id):
        """
        Check if a user is following another user.
        
        Args:
            follower_id (str): The ID of the follower
            following_id (str): The ID of the user to check
            
        Returns:
            bool: True if following
        """
        db = get_db()
        follow = db.follows.find_one({
            'follower_id': ObjectId(follower_id),
            'following_id': ObjectId(following_id)
        })
        return follow is not None
    
    @staticmethod
    def get_followers(user_id, limit=10, skip=0):
        """
        Get followers of a user.
        
        Args:
            user_id (str): The user ID
            limit (int): Maximum number of results
            skip (int): Number of results to skip
            
        Returns:
            list: List of follower user documents
        """
        db = get_db()
        follows = list(db.follows.find({
            'following_id': ObjectId(user_id)
        }).skip(skip).limit(limit))
        
        follower_ids = [follow['follower_id'] for follow in follows]
        followers = list(db.users.find({
            '_id': {'$in': follower_ids}
        }, {'password': 0}))
        
        return followers
    
    @staticmethod
    def get_following(user_id, limit=10, skip=0):
        """
        Get users that a user is following.
        
        Args:
            user_id (str): The user ID
            limit (int): Maximum number of results
            skip (int): Number of results to skip
            
        Returns:
            list: List of followed user documents
        """
        db = get_db()
        follows = list(db.follows.find({
            'follower_id': ObjectId(user_id)
        }).skip(skip).limit(limit))
        
        following_ids = [follow['following_id'] for follow in follows]
        following = list(db.users.find({
            '_id': {'$in': following_ids}
        }, {'password': 0}))
        
        return following
    
    @staticmethod
    def update_profile(user_id, updates):
        """
        Update a user's profile.
        
        Args:
            user_id (str): The user ID
            updates (dict): The updates to apply
            
        Returns:
            dict: The updated user document
        """
        allowed_fields = ['username', 'bio', 'profile_pic']
        update_data = {k: v for k, v in updates.items() if k in allowed_fields}
        update_data['updated_at'] = datetime.datetime.utcnow()
        
        db = get_db()
        db.users.update_one(
            {'_id': ObjectId(user_id)},
            {'$set': update_data}
        )
        
        return User.find_by_id(user_id)
    
    @staticmethod
    def get_following_ids(user_id):
        """
        Get a list of ObjectIds of users that the given user follows
        """
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
            
        db = get_db()
        
        # Find all follows where this user is the follower
        follows = list(db.follows.find({'follower_id': user_id}))
        
        # Extract the following_id from each follow document
        following_ids = [follow['following_id'] for follow in follows]
        
        # For debugging
        print(f"User {user_id} is following {len(following_ids)} users")
        
        return following_ids
    
    @staticmethod
    def get_by_id(user_id):
        """
        Get a user by ID
        
        Args:
            user_id (str or ObjectId): The ID of the user to get
            
        Returns:
            dict: The user object or None if not found
        """
        db = get_db()
        
        # Convert to ObjectId if string
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
            
        return db.users.find_one({"_id": user_id})