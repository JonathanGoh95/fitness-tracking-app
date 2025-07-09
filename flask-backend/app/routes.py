from flask import Blueprint, jsonify, request
from app.models import db, Workout, User
# Import Authentication Middleware
from app.auth_middleware import token_required
# Import bcrypt for Password Hashing
import bcrypt
import jwt
# To enable access of .env file
from dotenv import load_dotenv
import os
load_dotenv()

api_blueprint = Blueprint('api', __name__)

@api_blueprint.route('/sign-up', methods=['POST'])
def sign_up():
    new_user_data = request.get_json()
    # Extract username, email and password from request JSON
    username = new_user_data.get('username')
    email = new_user_data.get('email')
    password = new_user_data.get('password')
    role = new_user_data.get('role', 'user')

    # Validation for potential errors (Missing Fields/Existing Username)
    if not username or not password or not email:
        return jsonify({"error": "Missing data in fields"}), 400
    # Retrieves and checks the first result found by filtering the username/email from the User table
    if User.query.filter_by(username=username).first():
        return jsonify({"error": "Username already exists"}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email Address already exists"}), 400
    
    try:
        hashed_password = bcrypt.hashpw(bytes(password, 'utf-8'), bcrypt.gensalt())
        new_user = User(username=username, email=email, password_hash=hashed_password, role=role)
        db.session.add(new_user)
        db.session.commit()
        
        # Fetch user info after saving the database to create token payload
        user_info = {
            "id": new_user.id,
            "username": new_user.username,
            "role": new_user.role
        }
        token = jwt.encode(user_info, os.getenv('JWT_SECRET'), algorithm="HS256")
        # Returns a message with the token
        return jsonify({'message': 'User Created Successfully!', 'token': token}), 201
    except Exception as err:
        # Rollback if potential errors are encountered
        db.session.rollback()
        return jsonify({"err": str(err)}), 500
    
@api_blueprint.route('/sign-in', methods=['POST'])
def sign_in():
    sign_in_form_data = request.get_json()
    # Extract username and password from request JSON
    username = sign_in_form_data.get('username')
    password = sign_in_form_data.get('password')

    # Validation for potential errors (Missing Fields/Existing Username)
    if not username or not password:
        return jsonify({"error": "Missing data in fields"}), 400
    
    user = User.query.filter_by(username=username).first()

    if not user:
        return jsonify({"err": "Invalid credentials."}), 401
    password_is_valid = bcrypt.checkpw(
        bytes(password, 'utf-8'),
        bytes(user.password_hash, 'utf-8')
    )
    if not password_is_valid:
        return jsonify({"err": "Invalid credentials."}), 401
    
    try:
        # Fetch user info to create token payload
        user_info = {
            "id": user.id,
            "username": user.username,
            "role": user.role
        }
        token = jwt.encode(user_info, os.getenv('JWT_SECRET'), algorithm="HS256")
        return jsonify({'message': 'Sign In Successful', 'token': token}), 200
    except Exception as err:
        # Rollback on potential errors
        db.session.rollback()
        return jsonify({"err": str(err)}), 500

@api_blueprint.route('/workouts', methods=['GET'])
@token_required
def get_workouts():
    workouts = Workout.query.all()
    return jsonify([{"id": w.id, "name": w.name, "duration": w.duration} for w in workouts])

@api_blueprint.route('/workouts', methods=['POST'])
@token_required
def add_workout():
    data = request.get_json()
    new_workout = Workout(name=data['name'], duration=data['duration'])
    db.session.add(new_workout)
    db.session.commit()
    return jsonify({"message": "Workout added!"}), 201
