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

# Sign Up Route
@api_blueprint.route('/sign-up', methods=['POST'])
def sign_up():
    new_user_data = request.get_json()
    missing = validate_fields(new_user_data, ['username', 'email', 'password', 'passwordConfirm', 'user_weight'])
    # Concatenate all missing fields into a single string message
    if missing:
        return jsonify({'error': f"Missing fields: {', '.join(missing)}"}), 400
    # Extract username, email and password from request JSON
    username = new_user_data.get('username')
    email = new_user_data.get('email')
    password = new_user_data.get('password')
    user_role = new_user_data.get('user_role', 'user')
    user_weight = new_user_data.get('user_weight')
    # Create hashed password using bcrypt
    hashed_password = bcrypt.hashpw(bytes(password, 'utf-8'), bcrypt.gensalt())
    db = get_db()
    try:
        with db.cursor() as cur:
            cur.execute("SELECT id FROM users WHERE username = %s OR email = %s", (username, email))
            if cur.fetchone():
                return jsonify({'error': 'Username or Email Address already exists'}), 409
            
            cur.execute(
                "INSERT INTO users (username, email, password_hash, user_weight, user_role) VALUES (%s, %s, %s, %s, %s) RETURNING id, username, user_weight, user_role",
                (username, email, hashed_password, user_weight, user_role)
            )
            user = cur.fetchone()
        db.commit()
        # Create token payload
        user_info = {
            "id": user[0],
            "username": user[1],
            "user_weight": user[2],
            "user_role": user[3]
        }
        token = jwt.encode(user_info, os.getenv('JWT_SECRET'), algorithm="HS256")
        # Returns a message with the token
        return jsonify({'message': 'User Created Successfully!', 'token': token}), 201
    except Exception as err:
        # Rollback(Undo) changes if potential errors are encountered
        db.rollback()
        return jsonify({"error": str(err)}), 500

# Admin Sign Up Route
@api_blueprint.route('/admin/sign-up', methods=['POST'])
@token_required
def admin_sign_up(current_user):
    if current_user.get('user_role') != 'admin':
        return jsonify({"error": "Not authorized to create admin accounts"}), 403
    new_admin_data = request.get_json()
    missing = validate_fields(new_admin_data, ['username', 'email', 'password', 'passwordConfirm', 'user_weight'])
    # Concatenate all missing fields into a single string message
    if missing:
        return jsonify({'error': f"Missing fields: {', '.join(missing)}"}), 400
    # Extract username, email and password from request JSON
    username = new_admin_data.get('username')
    email = new_admin_data.get('email')
    password = new_admin_data.get('password')
    user_role = 'admin'
    user_weight = new_admin_data.get('user_weight')
    # Create hashed password using bcrypt
    hashed_password = bcrypt.hashpw(bytes(password, 'utf-8'), bcrypt.gensalt())
    
    db = get_db()
    try:
        with db.cursor() as cur:
            cur.execute("SELECT id FROM users WHERE username = %s OR email = %s", (username, email))
            if cur.fetchone():
                return jsonify({'error': 'Username or Email Address already exists'}), 409
            
            cur.execute(
                "INSERT INTO users (username, email, password_hash, user_weight, user_role) VALUES (%s, %s, %s, %s, %s)",
                (username, email, hashed_password, user_weight, user_role)
            )
        db.commit()
        # Returns a message
        return jsonify({'message': 'Admin Created Successfully!'}), 201
    except Exception as err:
        # Rollback(Undo) changes if potential errors are encountered
        db.rollback()
        return jsonify({"error": str(err)}), 500

# Sign In Route
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
            cur.execute("SELECT id, username, password_hash, user_weight, user_role FROM users WHERE username = %s", (username,))
            user = cur.fetchone()
            
            if not user:
                return jsonify({"error": "Invalid credentials."}), 401
            
            password_is_valid = bcrypt.checkpw(
                bytes(password, 'utf-8'),
                bytes(user[2], 'utf-8')
            )
            
            if not password_is_valid:
                return jsonify({"error": "Invalid credentials."}), 401
            
        # Fetch user info to create token payload
        user_info = {
            "id": user[0],
            "username": user[1],
            "user_weight": user[3],
            "user_role": user[4]
        }
        token = jwt.encode(user_info, os.getenv('JWT_SECRET'), algorithm="HS256")
        return jsonify({'message': 'Sign In Successful', 'token': token}), 200
    except Exception as err:
        return jsonify({"error": str(err)}), 500

# Fetch User Workouts
@workout_blueprint.route('/<int:user_id>', methods=['GET'])
@token_required
def get_user_workouts(user_id):
    db = get_db()
    try:
        with db.cursor() as cur:
            cur.execute(
            """
            SELECT w.id, w.duration_mins, w.calories_burned, w.workout_date,
            wt.workout_name AS workout_type, ct.category_name AS category
            FROM workouts w
            JOIN workout_types wt ON w.workout_type_id = wt.id
            JOIN category_types ct ON wt.category_id = ct.id
            WHERE w.user_id = %s
            ORDER BY w.workout_date DESC
            """,
            (user_id,)
        )
            workouts = cur.fetchall()
        workout_data = [
        {
            'id': w[0],
            'duration_mins': w[1],
            'calories_burned': w[2],
            'workout_date': w[3].isoformat(),
            'workout_type': w[4],
            'category': w[5]
        }
        for w in workouts
    ]
        return jsonify(workout_data)
    except Exception as err:
        return jsonify({"error": str(err)}), 500

# Delete User Workout
@workout_blueprint.route('/<int:workoutId>', methods=['DELETE'])
@token_required
def delete_user_workout(workoutId):
    db = get_db()
    try:
        with db.cursor() as cur:
            cur.execute(
            "DELETE FROM workouts WHERE id = %s",(workoutId,)
        )
        db.commit()
        return jsonify({"message": "Workout deleted successfully."}), 200
    except Exception as err:
        return jsonify({"error": str(err)}), 500

# Fetch Category Types and Workout Types Metadata
@workout_blueprint.route('/metadata', methods=['GET'])
@token_required
def get_workout_metadata():
    db = get_db()
    try:
        with db.cursor() as cur:
            cur.execute("SELECT id, category_name FROM category_types ORDER BY category_name")
            categories = [{"id": c[0], "category_name": c[1]} for c in cur.fetchall()]
            cur.execute("SELECT id, workout_name, met_value, category_id FROM workout_types ORDER BY workout_name")
            workout_types = [
                {"id": w[0], "workout_name": w[1], "met_value": w[2],"category_id": w[3]} for w in cur.fetchall()
            ]
        return jsonify({
            "categories": categories,
            "workout_types": workout_types
        }), 200
    except Exception as err:
        return jsonify({"error": str(err)}), 500
    
# Add a New Workout
@workout_blueprint.route('/new', methods=['POST'])
@token_required
def add_workout():
    workout_data = request.get_json()
    user_id = workout_data.get('user_id')
    workout_type_id = workout_data.get('workout_type_id')
    duration_mins = workout_data.get('duration_mins')
    calories_burned = workout_data.get('calories_burned')
    workout_date = workout_data.get('workout_date')
    db = get_db()
    try:
        with db.cursor() as cur:
            cur.execute(
                "INSERT INTO workouts (user_id, workout_type_id, duration_mins, calories_burned, workout_date) VALUES (%s, %s, %s, %s, %s) RETURNING id, user_id, duration_mins, calories_burned, workout_date",
                (user_id, workout_type_id, duration_mins, calories_burned, workout_date)
            )
        db.commit()
        return jsonify({'message': 'Workout Created Successfully!'}), 201
    except Exception as err:
        return jsonify({"error": str(err)}), 500

# @workout_blueprint.route('/', methods=['POST'])
# @token_required
# def add_workout():
#     db = get_db()
#     with db.cursor() as cur:
#         cur.execute("SELECT id, name, duration, user_id FROM workouts")
#         workouts = cur.fetchall()
#     data = request.get_json()
#     new_workout = Workout(name=data['name'], duration=data['duration'])
#     db.session.add(new_workout)
#     db.session.commit()
#     return jsonify({"message": "Workout added!"}), 201
