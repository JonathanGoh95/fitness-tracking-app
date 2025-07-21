import psycopg
import bcrypt
from datetime import date
from dotenv import load_dotenv
load_dotenv()
import os

DATABASE_URI = os.getenv('POSTGRES_URL')

# Seeding function
def seed():
    conn = psycopg.connect(DATABASE_URI)
    try:
        with conn.cursor() as cur:
            # Clear existing data in correct order (FK-safe)
            cur.execute("DELETE FROM workouts")
            cur.execute("DELETE FROM workout_types")
            cur.execute("DELETE FROM category_types")
            cur.execute("DELETE FROM users")
            conn.commit()
            print("✅ Existing data cleared.")
            
            # Seed Sample Users
            users = [
                {"username": "alice", "email": "alice@example.com", "password": "password123", "user_weight": 55.0, "user_role": "user"},
                {"username": "bob", "email": "bob@example.com", "password": "securepass", "user_weight": 70.5, "user_role": "user"},
                {"username": "carol", "email": "carol@example.com", "password": "carolpass", "user_weight": 62.0, "user_role": "user"},
                {"username": "dave", "email": "dave@example.com", "password": "davepass", "user_weight": 80.0, "user_role": "user"},
                {"username": "eve", "email": "eve@example.com", "password": "evepass", "user_weight": 58.0, "user_role": "user"},
                {"username": "John", "email": "adminjohn@adminexample.com", "password": "securepass123", "user_weight": 72.0, "user_role": "admin"},
                {"username": "Jane", "email": "adminjane@adminexample.com", "password": "securepass456", "user_weight": 48.0, "user_role": "admin"},
                {"username": "Mike", "email": "adminmike@adminexample.com", "password": "mikeadmin", "user_weight": 85.0, "user_role": "admin"},
                {"username": "Sara", "email": "adminsara@adminexample.com", "password": "saraadmin", "user_weight": 60.0, "user_role": "admin"},
            ]
            for user in users:
                hashed_pw = bcrypt.hashpw(bytes(user["password"], 'utf-8'), bcrypt.gensalt()).decode('utf-8')
                cur.execute(
                    "INSERT INTO users (username, email, password_hash, user_weight, user_role) VALUES (%s, %s, %s, %s, %s) RETURNING id",
                    (user["username"], user["email"], hashed_pw, user["user_weight"], user["user_role"])
                )
                user["id"] = cur.fetchone()[0]

            # Seed Category Types
            categories = ["Cardio", "Strength", "Flexibility", "Balance"]
            category_ids = {}
            for category_name in categories:
                cur.execute(
                    "INSERT INTO category_types (category_name) VALUES (%s) RETURNING id",
                    (category_name,)
                )
                category_ids[category_name] = cur.fetchone()[0]
            
            # Seed Workout Types (linked to category_types)
            workout_types = [
                {"name": "Running", "category": "Cardio", "met_value": 8.0},
                {"name": "Cycling", "category": "Cardio", "met_value": 6.0},
                {"name": "Weight Lifting", "category": "Strength", "met_value": 5.0},
                {"name": "Yoga", "category": "Flexibility", "met_value": 3.0},
                {"name": "Swimming", "category": "Cardio", "met_value": 7.0},
                {"name": "Rowing Machine", "category": "Cardio", "met_value": 7.0},
                {"name": "HIIT", "category": "Cardio", "met_value": 9.0},
                {"name": "Pilates", "category": "Flexibility", "met_value": 3.0},
                {"name": "Push-Ups", "category": "Strength", "met_value": 8.0},
                {"name": "Squats", "category": "Strength", "met_value": 5.0},
                {"name": "Tai Chi", "category": "Balance", "met_value": 3.0},
                {"name": "Jump Rope", "category": "Cardio", "met_value": 12.3},
                {"name": "Elliptical Trainer", "category": "Cardio", "met_value": 5.0},
                {"name": "Stair Climbing", "category": "Cardio", "met_value": 8.8},
                {"name": "Stretching", "category": "Flexibility", "met_value": 2.3},
            ]
            for wt in workout_types:
                category_id = category_ids[wt["category"]]
                cur.execute(
                    "INSERT INTO workout_types (workout_name, met_value, category_id) VALUES (%s, %s, %s) RETURNING id",
                    (wt["name"], wt["met_value"], category_id)
                )
                wt["id"] = cur.fetchone()[0]
            
            # Seed Workouts (linked to users and workout_types)
            workouts = [
                # Alice
                {"user": "alice", "workout_type": "Running", "duration": 30, "calories": 250, "date": date(2025, 7, 7)},
                {"user": "alice", "workout_type": "Yoga", "duration": 60, "calories": 180, "date": date(2025, 7, 8)},
                {"user": "alice", "workout_type": "Swimming", "duration": 45, "calories": 350, "date": date(2025, 7, 9)},
                # Bob
                {"user": "bob", "workout_type": "Yoga", "duration": 45, "calories": 200, "date": date(2025, 7, 6)},
                {"user": "bob", "workout_type": "Weight Lifting", "duration": 50, "calories": 400, "date": date(2025, 7, 10)},
                # Carol
                {"user": "carol", "workout_type": "Cycling", "duration": 40, "calories": 300, "date": date(2025, 7, 7)},
                {"user": "carol", "workout_type": "Pilates", "duration": 30, "calories": 120, "date": date(2025, 7, 8)},
                # Dave
                {"user": "dave", "workout_type": "HIIT", "duration": 25, "calories": 350, "date": date(2025, 7, 9)},
                {"user": "dave", "workout_type": "Push-Ups", "duration": 20, "calories": 150, "date": date(2025, 7, 10)},
                # Eve
                {"user": "eve", "workout_type": "Tai Chi", "duration": 60, "calories": 100, "date": date(2025, 7, 11)},
                {"user": "eve", "workout_type": "Stretching", "duration": 30, "calories": 50, "date": date(2025, 7, 12)},
                # Admins
                {"user": "John", "workout_type": "Rowing Machine", "duration": 35, "calories": 280, "date": date(2025, 7, 13)},
                {"user": "Jane", "workout_type": "Elliptical Trainer", "duration": 40, "calories": 220, "date": date(2025, 7, 14)},
                {"user": "Mike", "workout_type": "Stair Climbing", "duration": 30, "calories": 300, "date": date(2025, 7, 15)},
                {"user": "Sara", "workout_type": "Pilates", "duration": 45, "calories": 160, "date": date(2025, 7, 16)},
            ]
            for workout in workouts:
                user_id = next(u["id"] for u in users if u["username"] == workout["user"])
                workout_type_id = next(wt["id"] for wt in workout_types if wt["name"] == workout["workout_type"])
                cur.execute(
                    """
                    INSERT INTO workouts (user_id, workout_type_id, duration_mins, calories_burned, workout_date)
                    VALUES (%s, %s, %s, %s, %s)
                    """,
                    (user_id, workout_type_id, workout["duration"], workout["calories"], workout["date"])
                )
            conn.commit()
            print("✅ Database seeded successfully!")
    except Exception as err:
        conn.rollback()
        print("❌ Error during seeding:", err)
    finally:
        conn.close()

if __name__ == "__main__":
    seed()