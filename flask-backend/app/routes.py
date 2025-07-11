from flask import Blueprint, jsonify, request
# Import Authentication Middleware
from app.auth_middleware import token_required
# Import bcrypt for Password Hashing
import bcrypt
import jwt
# To enable access of .env file
from dotenv import load_dotenv
import os
load_dotenv()
from app.db import get_db

api_blueprint = Blueprint('api', __name__)
workout_blueprint = Blueprint('workouts', __name__, url_prefix="/workouts")

def validate_fields(data, required_fields):
    missing = [field for field in required_fields if field not in data or not data[field]]
    return missing

@api_blueprint.route('/sign-up', methods=['POST'])
def sign_up():
    new_user_data = request.get_json()
    missing = validate_fields(new_user_data, ['username', 'email', 'password'])
    if missing:
        return jsonify({'error': f"Missing fields: {', '.join(missing)}"}), 400
    # Extract username, email and password from request JSON
    username = new_user_data.get('username')
    email = new_user_data.get('email')
    password = new_user_data.get('password')
    role = new_user_data.get('user_role', 'user')

    hashed_password = bcrypt.hashpw(bytes(password, 'utf-8'), bcrypt.gensalt())
    db = get_db()
    try:
        with db.cursor() as cur:
            cur.execute("SELECT id FROM users WHERE username = %s", (username,))
            if cur.fetchone():
                return jsonify({'error': 'Username already exists'}), 409
            
            cur.execute("SELECT id FROM users WHERE email = %s", (email,))
            if cur.fetchone():
                return jsonify({'error': 'Email Address already exists'}), 409
            
            cur.execute(
                "INSERT INTO users (username, email, password_hash, user_role) VALUES (%s, %s, %s, %s) RETURNING id, username, user_role",
                (username, email, hashed_password, role)
            )
            user = cur.fetchone()
        db.commit()
        # Create token payload
        user_info = {
            "id": user[0],
            "username": user[1],
            "user_role": user[2]
        }
        token = jwt.encode(user_info, os.getenv('JWT_SECRET'), algorithm="HS256")
        # Returns a message with the token
        return jsonify({'message': 'User Created Successfully!', 'token': token}), 201
    except Exception as err:
        # Rollback(Undo) changes if potential errors are encountered
        db.rollback()
        return jsonify({"err": str(err)}), 500
    
@api_blueprint.route('/sign-in', methods=['POST'])
def sign_in():
    sign_in_form_data = request.get_json()
    # Extract username and password from request JSON
    username = sign_in_form_data.get('username')
    password = sign_in_form_data.get('password')

    # Validation for potential errors (Missing Fields/Existing Username)
    missing = validate_fields(sign_in_form_data, ['username', 'password'])
    if missing:
        return jsonify({'error': f"Missing fields: {', '.join(missing)}"}), 400

    db = get_db()
    try:
        with db.cursor() as cur:
            cur.execute("SELECT id, username, password_hash, user_role FROM users WHERE username = %s", (username,))
            user = cur.fetchone()
            
            if not user:
                return jsonify({"err": "Invalid credentials."}), 401
            
            password_is_valid = bcrypt.checkpw(
                bytes(password, 'utf-8'),
                bytes(user[2], 'utf-8')
            )
            
            if not password_is_valid:
                return jsonify({"err": "Invalid credentials."}), 401
            
        # Fetch user info to create token payload
        user_info = {
            "id": user[0],
            "username": user[1],
            "user_role": user[3]
        }
        token = jwt.encode(user_info, os.getenv('JWT_SECRET'), algorithm="HS256")
        return jsonify({'message': 'Sign In Successful', 'token': token}), 200
    except Exception as err:
        return jsonify({"err": str(err)}), 500

@workout_blueprint.route('/', methods=['GET'])
@token_required
def get_workouts():
    workouts = Workout.query.all()
    return jsonify([{"id": w.id, "name": w.name, "duration": w.duration} for w in workouts])

@workout_blueprint.route('/', methods=['POST'])
@token_required
def add_workout():
    db = get_db()
    with db.cursor() as cur:
        cur.execute("SELECT id, name, duration, user_id FROM workouts")
        workouts = cur.fetchall()
    data = request.get_json()
    new_workout = Workout(name=data['name'], duration=data['duration'])
    db.session.add(new_workout)
    db.session.commit()
    return jsonify({"message": "Workout added!"}), 201
