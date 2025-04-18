from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.user import User
from models.meme import Meme
from bson import ObjectId

bp = Blueprint('users', __name__, url_prefix='/api/users')

@bp.route('/search', methods=['GET'])
@jwt_required()
def search_users():
    query = request.args.get('q', '')
    limit = int(request.args.get('limit', 10))
    skip = int(request.args.get('skip', 0))
    
    users = User.search(query, limit, skip)
    
    # Add following status
    current_user_id = get_jwt_identity()
    for user in users:
        user['is_following'] = User.is_following(current_user_id, str(user['_id']))
        user['_id'] = str(user['_id'])
    
    return jsonify(users), 200

@bp.route('/<user_id>', methods=['GET'])
@jwt_required()
def get_user(user_id):
    try:
        user = User.find_by_id(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Convert ObjectId to string
        user['_id'] = str(user['_id'])
        
        # Check if current user is following this user
        current_user_id = get_jwt_identity()
        user['is_following'] = User.is_following(current_user_id, user_id)
        
        # Get counts
        followers = User.get_followers(user_id)
        following = User.get_following(user_id)
        
        user['followers_count'] = len(followers)
        user['following_count'] = len(following)
        
        return jsonify(user), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@bp.route('/<user_id>/follow', methods=['POST'])
@jwt_required()
def follow_user(user_id):
    current_user_id = get_jwt_identity()
    
    # Cannot follow yourself
    if current_user_id == user_id:
        return jsonify({'error': 'Cannot follow yourself'}), 400
    
    # Check if user exists
    user = User.find_by_id(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    success = User.follow(current_user_id, user_id)
    
    if success:
        return jsonify({'message': 'User followed successfully'}), 200
    else:
        return jsonify({'error': 'Already following this user'}), 400

@bp.route('/<user_id>/unfollow', methods=['POST'])
@jwt_required()
def unfollow_user(user_id):
    current_user_id = get_jwt_identity()
    
    success = User.unfollow(current_user_id, user_id)
    
    if success:
        return jsonify({'message': 'User unfollowed successfully'}), 200
    else:
        return jsonify({'error': 'Not following this user'}), 400

@bp.route('/<user_id>/followers', methods=['GET'])
@jwt_required()
def get_followers(user_id):
    limit = int(request.args.get('limit', 10))
    skip = int(request.args.get('skip', 0))
    
    followers = User.get_followers(user_id, limit, skip)
    
    # Convert ObjectId to string
    for follower in followers:
        follower['_id'] = str(follower['_id'])
    
    return jsonify(followers), 200

@bp.route('/<user_id>/following', methods=['GET'])
@jwt_required()
def get_following(user_id):
    limit = int(request.args.get('limit', 10))
    skip = int(request.args.get('skip', 0))
    
    following = User.get_following(user_id, limit, skip)
    
    # Convert ObjectId to string
    for user in following:
        user['_id'] = str(user['_id'])
    
    return jsonify(following), 200

@bp.route('/<user_id>/memes', methods=['GET'])
@jwt_required()
def get_user_memes(user_id):
    limit = int(request.args.get('limit', 10))
    skip = int(request.args.get('skip', 0))
    
    memes = Meme.get_user_memes(user_id, limit, skip)
    
    # Convert ObjectId to string
    for meme in memes:
        meme['_id'] = str(meme['_id'])
        meme['user_id'] = str(meme['user_id'])
    
    return jsonify(memes), 200