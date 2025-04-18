from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.meme import Meme
from models.user import User
from services.cloudinary_service import upload_image
from werkzeug.utils import secure_filename
import os
from bson import ObjectId  # Add this import at the top of your file

bp = Blueprint('memes', __name__, url_prefix='/api/memes')

@bp.route('/', methods=['POST'])
@jwt_required()
def create_meme():
    user_id = get_jwt_identity()
    
    # Check if image file is provided
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400
    
    file = request.files['image']
    
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    caption = request.form.get('caption', '')
    
    try:
        # Upload image to Cloudinary
        upload_result = upload_image(file, user_id)
        
        # Create meme in database
        meme = Meme.create(
            user_id=user_id,
            image_url=upload_result['url'],
            caption=caption,
            cloudinary_public_id=upload_result['public_id']
        )
        
        # Convert ObjectId to string
        meme['_id'] = str(meme['_id'])
        meme['user_id'] = str(meme['user_id'])
        
        return jsonify(meme), 201
    except Exception as e:
        current_app.logger.error(f"Error creating meme: {str(e)}")
        return jsonify({'error': 'Failed to upload image'}), 500
def convert_objectids_to_str(obj):
    """
    Recursively convert all ObjectId values to strings in a dict, list, or other object.
    """
    if isinstance(obj, ObjectId):
        return str(obj)
    elif isinstance(obj, dict):
        return {key: convert_objectids_to_str(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [convert_objectids_to_str(item) for item in obj]
    elif isinstance(obj, tuple):
        return tuple(convert_objectids_to_str(item) for item in obj)
    else:
        return obj
    
@bp.route('/feed', methods=['GET'])
@jwt_required()
def get_feed():
    user_id = get_jwt_identity()
    limit = int(request.args.get('limit', 10))
    skip = int(request.args.get('skip', 0))
    
    print(f"Getting feed for user {user_id}")
    from models.user import User
    following_ids = User.get_following_ids(user_id)
    print(f"User follows these users: {following_ids}")
    
    memes = Meme.get_feed_for_user(user_id, limit, skip)
    print(f"Found {len(memes)} memes for feed")
    
    # Only use one method of converting ObjectIds to strings
    converted_memes = convert_objectids_to_str(memes)
    
    # Check for duplicate IDs (for debugging)
    ids = [meme['_id'] for meme in converted_memes]
    duplicate_ids = set([id for id in ids if ids.count(id) > 1])
    if duplicate_ids:
        print(f"WARNING: Found duplicate meme IDs: {duplicate_ids}")
    
    return jsonify(converted_memes), 200

@bp.route('/<meme_id>', methods=['GET'])
@jwt_required()
def get_meme(meme_id):
    meme = Meme.find_by_id(meme_id)
    
    if not meme:
        return jsonify({'error': 'Meme not found'}), 404
    
    # Convert ObjectId to string
    meme['_id'] = str(meme['_id'])
    meme['user_id'] = str(meme['user_id'])
    
    # Get user info
    user = User.find_by_id(meme['user_id'])
    meme['user'] = user
    
    # Check if current user has liked this meme
    user_id = get_jwt_identity()
    like = current_app.mongo.db.likes.find_one({
        'meme_id': meme['_id'],
        'user_id': user_id
    })
    meme['liked_by_user'] = like is not None
    
    return jsonify(meme), 200

@bp.route('/<meme_id>', methods=['PUT'])
@jwt_required()
def update_meme(meme_id):
    user_id = get_jwt_identity()
    data = request.get_json()
    
    updated_meme = Meme.update(meme_id, user_id, data)
    
    if not updated_meme:
        return jsonify({'error': 'Meme not found or unauthorized'}), 404
    
    # Convert ObjectId to string
    updated_meme['_id'] = str(updated_meme['_id'])
    updated_meme['user_id'] = str(updated_meme['user_id'])
    
    return jsonify(updated_meme), 200

@bp.route('/<meme_id>', methods=['DELETE'])
@jwt_required()
def delete_meme(meme_id):
    user_id = get_jwt_identity()
    
    success = Meme.delete(meme_id, user_id)
    
    if success:
        return jsonify({'message': 'Meme deleted successfully'}), 200
    else:
        return jsonify({'error': 'Meme not found or unauthorized'}), 404

@bp.route('/<meme_id>/like', methods=['POST'])
@jwt_required()
def like_meme(meme_id):
    user_id = get_jwt_identity()
    
    # Check if meme exists
    meme = Meme.find_by_id(meme_id)
    
    if not meme:
        return jsonify({'error': 'Meme not found'}), 404
    
    success = Meme.like(meme_id, user_id)
    
    if success:
        return jsonify({'message': 'Meme liked successfully'}), 200
    else:
        return jsonify({'error': 'Already liked this meme'}), 400

@bp.route('/<meme_id>/unlike', methods=['POST'])
@jwt_required()
def unlike_meme(meme_id):
    user_id = get_jwt_identity()
    
    success = Meme.unlike(meme_id, user_id)
    
    if success:
        return jsonify({'message': 'Meme unliked successfully'}), 200
    else:
        return jsonify({'error': 'Not liked this meme'}), 400

@bp.route('/<meme_id>/comments', methods=['POST'])
@jwt_required()
def add_comment(meme_id):
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if 'text' not in data or not data['text'].strip():
        return jsonify({'error': 'Comment text is required'}), 400
    
    # Check if meme exists
    meme = Meme.find_by_id(meme_id)
    if not meme:
        return jsonify({'error': 'Meme not found'}), 404
    
    comment = Meme.add_comment(meme_id, user_id, data['text'])
    
    # Convert ObjectId to string
    comment['_id'] = str(comment['_id'])
    comment['meme_id'] = str(comment['meme_id'])
    comment['user_id'] = str(comment['user_id'])
    
    # Get user info
    user = User.find_by_id(user_id)
    comment['user'] = user
    
    return jsonify(comment), 201

@bp.route('/<meme_id>/comments', methods=['GET'])
@jwt_required()
def get_comments(meme_id):
    limit = int(request.args.get('limit', 10))
    skip = int(request.args.get('skip', 0))
    
    # Check if meme exists
    meme = Meme.find_by_id(meme_id)
    if not meme:
        return jsonify({'error': 'Meme not found'}), 404
    
    comments = Meme.get_comments(meme_id, limit, skip)
    
    # Convert ObjectId to string
    for comment in comments:
        comment['_id'] = str(comment['_id'])
        comment['meme_id'] = str(comment['meme_id'])
        comment['user_id'] = str(comment['user_id'])
        
        if 'user' in comment:
            comment['user']['_id'] = str(comment['user']['_id'])
    
    return jsonify(comments), 200

@bp.route('/comments/<comment_id>', methods=['DELETE'])
@jwt_required()
def delete_comment(comment_id):
    user_id = get_jwt_identity()
    
    success = Meme.delete_comment(comment_id, user_id)
    
    if success:
        return jsonify({'message': 'Comment deleted successfully'}), 200
    else:
        return jsonify({'error': 'Comment not found or unauthorized'}), 404