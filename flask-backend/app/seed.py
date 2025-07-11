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
                    {"username": "alice", "email": "alice@example.com", "password": "password123", "user_role": "user"},
                    {"username": "bob", "email": "bob@example.com", "password": "securepass", "user_role": "admin"},
                ]
            for user in users:
                hashed_pw = bcrypt.hashpw(bytes(user["password"], 'utf-8'), bcrypt.gensalt())
                cur.execute(
                    "INSERT INTO users (username, email, password_hash, user_role) VALUES (%s, %s, %s, %s) RETURNING id",
                    (user["username"], user["email"], hashed_pw, user["user_role"])
                )
                user["id"] = cur.fetchone()[0]
            
            # Seed Category Types
            categories = ["Cardio", "Strength", "Flexibility", "Balance"]
            category_ids = {}
            for name in categories:
                cur.execute(
                    "INSERT INTO category_types (name) VALUES (%s) RETURNING id",
                    (name,)
                )
                category_ids[name] = cur.fetchone()[0]
            
            # Seed Workout Types (linked to category_types)
            workout_types = [
                {"name": "Running", "category": "Cardio"},
                {"name": "Cycling", "category": "Cardio"},
                {"name": "Weight Lifting", "category": "Strength"},
                {"name": "Yoga", "category": "Flexibility"},
            ]
            for wt in workout_types:
                category_id = category_ids[wt["category"]]
                cur.execute(
                    "INSERT INTO workout_types (name, category_id) VALUES (%s, %s) RETURNING id",
                    (wt["name"], category_id)
                )
                wt["id"] = cur.fetchone()[0]
            
            # Seed Workouts (linked to users and workout_types)
            workouts = [
                {
                    "user": "alice",
                    "workout_type": "Running",
                    "duration": 30,
                    "calories": 250,
                    "date": date(2025, 7, 7)
                },
                {
                    "user": "bob",
                    "workout_type": "Yoga",
                    "duration": 45,
                    "calories": 200,
                    "date": date(2025, 7, 6)
                },
                {
                    "user": "alice",
                    "workout_type": "Weight Lifting",
                    "duration": 60,
                    "calories": 400,
                    "date": date(2025, 7, 5)
                },
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