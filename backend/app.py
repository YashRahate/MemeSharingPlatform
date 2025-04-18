from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
import cloudinary
from config import Config
from routes import auth_routes, user_routes, meme_routes
from services.mongodb_service import init_db

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Initialize CORS
    CORS(app)
    
    # Initialize JWT
    jwt = JWTManager(app)
    
    # Initialize MongoDB
    init_db(app)
    
    # Initialize Cloudinary
    cloudinary.config(
        cloud_name=app.config['CLOUDINARY_CLOUD_NAME'],
        api_key=app.config['CLOUDINARY_API_KEY'],
        api_secret=app.config['CLOUDINARY_API_SECRET']
    )
    
    # Register blueprints
    app.register_blueprint(auth_routes.bp)
    app.register_blueprint(user_routes.bp)
    app.register_blueprint(meme_routes.bp)
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)