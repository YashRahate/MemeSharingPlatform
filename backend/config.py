import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Flask settings
    SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key-for-development')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'your-jwt-secret-key')
    JWT_ACCESS_TOKEN_EXPIRES = 86400  # 24 hours

    # MongoDB settings
    MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/MemePlatform')
    DB_NAME = 'MemePlatform'

    # Cloudinary settings
    CLOUDINARY_CLOUD_NAME = os.getenv('CLOUDINARY_CLOUD_NAME')
    CLOUDINARY_API_KEY = os.getenv('CLOUDINARY_API_KEY')
    CLOUDINARY_API_SECRET = os.getenv('CLOUDINARY_API_SECRET')