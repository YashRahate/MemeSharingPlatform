import bcrypt
from flask_jwt_extended import create_access_token
from datetime import timedelta

def hash_password(password):
    """
    Hash a password using bcrypt.
    
    Args:
        password (str): The plain text password
        
    Returns:
        str: The hashed password
    """
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def check_password(password, hashed_password):
    """
    Check if a password matches a hash.
    
    Args:
        password (str): The plain text password
        hashed_password (str): The hashed password
        
    Returns:
        bool: True if the password matches
    """
    return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))

def generate_token(user_id, expires_delta=None):
    """
    Generate a JWT token for a user.
    
    Args:
        user_id (str): The user ID
        expires_delta (timedelta, optional): Token expiration time
        
    Returns:
        str: The JWT token
    """
    return create_access_token(
        identity=str(user_id),
        expires_delta=expires_delta
    )