from flask import current_app, g
from pymongo import MongoClient

def get_db():
    """Return a MongoDB client instance."""
    if 'db' not in g:
        client = MongoClient(current_app.config['MONGO_URI'])
        g.db = client[current_app.config['DB_NAME']]
    return g.db

def close_db(e=None):
    """Close the MongoDB client connection."""
    db = g.pop('db', None)
    if db is not None:
        db.client.close()

def init_db(app):
    """Initialize the MongoDB connection."""
    app.teardown_appcontext(close_db)
    
    # Create initial MongoDB collections and indexes if needed
    with app.app_context():
        db = get_db()
        
        # Create unique index for user emails
        if 'users' not in db.list_collection_names():
            db.create_collection('users')
            db.users.create_index('email', unique=True)
            db.users.create_index('username', unique=True)
        
        # Create indexes for memes
        if 'memes' not in db.list_collection_names():
            db.create_collection('memes')
            db.memes.create_index('user_id')
        
        # Create indexes for follows
        if 'follows' not in db.list_collection_names():
            db.create_collection('follows')
            db.follows.create_index([('follower_id', 1), ('following_id', 1)], unique=True)
        
        # Create indexes for likes
        if 'likes' not in db.list_collection_names():
            db.create_collection('likes')
            db.likes.create_index([('meme_id', 1), ('user_id', 1)], unique=True)
        
        # Create indexes for comments
        if 'comments' not in db.list_collection_names():
            db.create_collection('comments')
            db.comments.create_index('meme_id')