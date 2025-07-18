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
user_blueprint = Blueprint('users', __name__, url_prefix="/users")

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
    hashed_password = bcrypt.hashpw(bytes(password, 'utf-8'), bcrypt.gensalt()).decode('utf-8')
    db = get_db()
    try:
        with db.cursor() as cur:
            cur.execute("SELECT id FROM users WHERE username = %s OR email = %s", (username, email))
            if cur.fetchone():
                return jsonify({'error': 'Username or Email Address already exists'}), 409
            
            cur.execute(
                "INSERT INTO users (username, email, password_hash, user_weight, user_role) VALUES (%s, %s, %s, %s, %s) RETURNING id, username, email, user_weight, user_role",
                (username, email, hashed_password, user_weight, user_role)
            )
            user = cur.fetchone()
        db.commit()
        # Create token payload
        user_info = {
            "id": user[0],
            "username": user[1],
            "email": user[2],
            "user_weight": float(user[3]),
            "user_role": user[4]
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
    hashed_password = bcrypt.hashpw(bytes(password, 'utf-8'), bcrypt.gensalt()).decode('utf-8')
    
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
            cur.execute("SELECT id, username, email, password_hash, user_weight, user_role FROM users WHERE username = %s", (username,))
            user = cur.fetchone()
            if not user:
                return jsonify({"error": "Invalid Credentials."}), 401
            
            password_is_valid = bcrypt.checkpw(
                bytes(password, 'utf-8'),
                user[3].encode('utf-8')
            )
            if not password_is_valid:
                return jsonify({"error": "Invalid Credentials."}), 401
            
        # Fetch user info to create token payload
        user_info = {
            "id": user[0],
            "username": user[1],
            "email": user[2],
            "user_weight": float(user[4]),
            "user_role": user[5]
        }
        token = jwt.encode(user_info, os.getenv('JWT_SECRET'), algorithm="HS256")
        return jsonify({'message': 'Sign In Successful', 'token': token}), 200
    except Exception as err:
        return jsonify({"error": str(err)}), 500

# Fetch User Workouts
@workout_blueprint.route('/', methods=['GET'])
@token_required
def get_user_workouts(current_user):
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
            (current_user['id'],)
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
def delete_user_workout(current_user, workoutId):
    db = get_db()
    try:
        with db.cursor() as cur:
            cur.execute(
                "DELETE FROM workouts WHERE id = %s AND user_id = %s",(workoutId, current_user['id'])
            )
            if cur.rowcount == 0:
                return jsonify({"error": "Workout not found/authorized."}), 404
        db.commit()
        return jsonify({"message": "Workout deleted successfully."}), 200
    except Exception as err:
        return jsonify({"error": str(err)}), 500

# Fetch Category Types and Workout Types Metadata for populating Workout Form fields
@workout_blueprint.route('/metadata', methods=['GET'])
@token_required
def get_workout_metadata(current_user):
    db = get_db()
    try:
        with db.cursor() as cur:
            cur.execute(
                """
                SELECT wt.id, wt.workout_name, wt.met_value, ct.category_name FROM workout_types wt
                JOIN category_types ct ON wt.category_id = ct.id
                """)
            data = cur.fetchall()
        metadata = [
        {
            'id': meta[0],
            'workout_name': meta[1],
            'met_value': float(meta[2]),
            'category_name': meta[3],
        }
        for meta in data
        ]
        return jsonify(metadata), 200
    except Exception as err:
        return jsonify({"error": str(err)}), 500
    
# Add a New Workout
@workout_blueprint.route('/new', methods=['POST'])
@token_required
def add_workout(current_user):
    workout_data = request.get_json()
    # Validation for required fields
    missing = validate_fields(workout_data, ['workout_type_id', 'duration_mins', 'calories_burned', 'workout_date'])
    if missing:
        return jsonify({'error': f"Missing fields: {', '.join(missing)}"}), 400
    workout_type_id = workout_data.get('workout_type_id')
    duration_mins = workout_data.get('duration_mins')
    calories_burned = workout_data.get('calories_burned')
    workout_date = workout_data.get('workout_date')
    db = get_db()
    try:
        with db.cursor() as cur:
            cur.execute(
                "INSERT INTO workouts (user_id, workout_type_id, duration_mins, calories_burned, workout_date) VALUES (%s, %s, %s, %s, %s)",
                (current_user['id'], workout_type_id, duration_mins, calories_burned, workout_date)
            )
        db.commit()
        return jsonify({'message': 'Workout Created Successfully!'}), 201
    except Exception as err:
        return jsonify({"error": str(err)}), 500
    
# Fetch One Workout
@workout_blueprint.route('/<int:workoutId>/', methods=['GET'])
@token_required
def get_workout(current_user, workoutId):
    db = get_db()
    try:
        with db.cursor() as cur:
            cur.execute(
                """
                SELECT w.id, w.duration_mins, w.calories_burned, w.workout_date,
                w.workout_type_id, wt.workout_name, wt.category_id, ct.category_name
                FROM workouts w
                JOIN workout_types wt ON w.workout_type_id = wt.id
                JOIN category_types ct ON wt.category_id = ct.id
                WHERE w.id = %s AND w.user_id = %s
                """,
                (workoutId, current_user['id'])
            )
            row = cur.fetchone()
            if not row:
                return jsonify({"error": "Workout not found"}), 404
            workout = {
                "id": row[0],
                "duration_mins": row[1],
                "calories_burned": row[2],
                "workout_date": row[3].isoformat(),
                "workout_type_id": row[4],
                "workout_type": row[5],
                "category_id": row[6],
                "category": row[7]
            }
        return jsonify(workout), 200
    except Exception as err:
        return jsonify({"error": str(err)}), 500
    
# Update Workout
@workout_blueprint.route('/<int:workoutId>/edit', methods=['PUT'])
@token_required
def update_workout(current_user, workoutId):
    update_workout_data = request.get_json()
    # Validation for required fields
    missing = validate_fields(update_workout_data, ['workout_type_id', 'duration_mins', 'calories_burned', 'workout_date'])
    if missing:
        return jsonify({'error': f"Missing fields: {', '.join(missing)}"}), 400
    workout_type_id = update_workout_data.get('workout_type_id')
    duration_mins = update_workout_data.get('duration_mins')
    calories_burned = update_workout_data.get('calories_burned')
    workout_date = update_workout_data.get('workout_date')
    db = get_db()
    try:
        with db.cursor() as cur:
            cur.execute(
                "UPDATE workouts SET workout_type_id = %s, duration_mins = %s, calories_burned = %s, workout_date = %s WHERE id = %s AND user_id = %s",
                (workout_type_id, duration_mins, calories_burned, workout_date, workoutId, current_user['id'])
            )
            if cur.rowcount == 0:
                return jsonify({'error': 'Workout not updated/authorized.'}), 404
            db.commit()
        return jsonify({'message': 'Workout Updated Successfully!'}), 200
    except Exception as err:
        return jsonify({"error": str(err)}), 500

# Fetch Users
@user_blueprint.route('/', methods=['GET'])
@token_required
def get_users(current_user):
    if current_user.get('user_role') != 'admin':
        return jsonify({"error": "Not authorized to view user accounts"}), 403
    db = get_db()
    try:
        with db.cursor() as cur:
            cur.execute(
            "SELECT id, username, email, user_weight, user_role FROM users"
            )
            users = cur.fetchall()
        users_data = [
        {
            'id': u[0],
            'username': u[1],
            'email': u[2],
            'user_weight': float(u[3]),
            'role': u[4],
        }
        for u in users
    ]
        return jsonify(users_data)
    except Exception as err:
        return jsonify({"error": str(err)}), 500

# Fetch User
@user_blueprint.route('/<int:userId>', methods=['GET'])
@token_required
def get_user(current_user, userId):
    if current_user.get('user_role') != 'admin' and current_user.get('id') != userId:
        return jsonify({"error": "Not authorized to view user account"}), 403
    db = get_db()
    try:
        with db.cursor() as cur:
            cur.execute(
            "SELECT id, username, email, user_weight, user_role FROM users WHERE id = %s", (userId,)
            )
            row = cur.fetchone()
            if not row:
                return jsonify({"error": "User not found"}), 404
        user_data = {
            'id': row[0],
            'username': row[1],
            'email': row[2],
            'user_weight': float(row[3]),
            'role': row[4],
        }
        return jsonify(user_data)
    except Exception as err:
        return jsonify({"error": str(err)}), 500

# Update User
@user_blueprint.route('/<int:userId>/edit', methods=['PUT'])
@token_required
def update_user(current_user, userId):
    if current_user.get('user_role') != 'admin' and current_user.get('id') != userId:
        return jsonify({"error": "Not authorized to edit user account"}), 403
    user_data = request.get_json()
    username = user_data.get('username')
    email = user_data.get('email')
    user_weight = user_data.get('user_weight')
    db = get_db()
    try:
        with db.cursor() as cur:
            cur.execute(
            "UPDATE users SET username = %s, email = %s, user_weight = %s WHERE id = %s RETURNING id, username, email, user_weight, user_role", (username, email, user_weight, userId)
            )
            if cur.rowcount == 0:
                return jsonify({"error": "User not updated/authorized"}), 404
            updated_user = cur.fetchone()
        db.commit()
        updated_user_info = {
            "id": updated_user[0],
            "username": updated_user[1],
            "email": updated_user[2],
            "user_weight": float(updated_user[3]),
            "user_role": updated_user[4]
        }
        updated_token = jwt.encode(updated_user_info, os.getenv('JWT_SECRET'), algorithm="HS256")
        return jsonify({'message': 'User Updated Successfully!', 'token': updated_token}), 200
    except Exception as err:
        return jsonify({"error": str(err)}), 500
    
# Delete User
@user_blueprint.route('/<int:userId>', methods=['DELETE'])
@token_required
def delete_user(current_user, userId):
    if current_user.get('user_role') != 'admin':
        return jsonify({"error": "Not authorized to delete user accounts"}), 403
    db = get_db()
    try:
        with db.cursor() as cur:
            cur.execute(
                "DELETE FROM users WHERE id = %s",(userId,)
            )
            if cur.rowcount == 0:
                return jsonify({"error": "User not found/authorized."}), 404
        db.commit()
        return jsonify({"message": "User deleted successfully."}), 200
    except Exception as err:
        return jsonify({"error": str(err)}), 500