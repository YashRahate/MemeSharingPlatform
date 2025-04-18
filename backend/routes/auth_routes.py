from flask import Blueprint, request, jsonify
from utils.auth_utils import check_password, generate_token
from models.user import User
from flask_jwt_extended import jwt_required, get_jwt_identity

bp = Blueprint('auth', __name__, url_prefix='/api/auth')

# Helper to serialize MongoDB document
def serialize_user(user, include_password=False):
    user['_id'] = str(user['_id'])
    if not include_password and 'password' in user:
        del user['password']
    return user

@bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    required_fields = ['username', 'email', 'password']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    existing_user = User.find_by_email(data['email'])
    if existing_user:
        return jsonify({'error': 'User with this email already exists'}), 409
        
    existing_username = User.find_by_username(data['username'])
    if existing_username:
        return jsonify({'error': 'Username already taken'}), 409
    
    user = User.create(
        username=data['username'],
        email=data['email'],
        password=data['password']
    )
    
    token = generate_token(user['_id'])
    return jsonify({
        'message': 'User registered successfully',
        'token': token,
        'user': serialize_user(user)
    }), 201

@bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if 'email' not in data or 'password' not in data:
        return jsonify({'error': 'Email and password are required'}), 400
    
    user = User.find_by_email(data['email'])
    if not user or not check_password(data['password'], user['password']):
        return jsonify({'error': 'Invalid email or password'}), 401
    
    token = generate_token(user['_id'])
    
    return jsonify({
        'message': 'Login successful',
        'token': token,
        'user': serialize_user(user)
    }), 200

@bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    user_id = get_jwt_identity()
    user = User.find_by_id(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify(serialize_user(user)), 200

@bp.route('/me', methods=['PUT'])
@jwt_required()
def update_current_user():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    updated_user = User.update_profile(user_id, data)
    
    return jsonify(serialize_user(updated_user)), 200
