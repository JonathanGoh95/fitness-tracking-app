from server import app, db  # Import your Flask app and db instance
from models import User, Workout, WorkoutType  # Models

# Sample Seed Data
users = [
    User(username="alice", email="alice@example.com", password_hash="hashedpassword1"),
    User(username="bob", email="bob@example.com", password_hash="hashedpassword2"),
]

workout_types = [
    WorkoutType(name="Walking", category="Cardio"),
    WorkoutType(name="Running", category="Cardio"),
    WorkoutType(name="Cycling", category="Cardio"),
]

workouts = [
    Workout(user_id=1, workout_type_id=2, duration_mins=30, calories_burned=250, date="2025-07-07"),
    Workout(user_id=2, workout_type_id=1, duration_mins=45, calories_burned=300, date="2025-07-06"),
]

# Seeding function
def seed():
    with app.app_context():  # Ensures Flask app context
        db.drop_all()        # Clears existing tables before creating the sample data
        db.create_all()

        db.session.add_all(users)
        db.session.add_all(workout_types)
        db.session.add_all(workouts)

        db.session.commit()
        print("✅ Database seeded successfully!")

if __name__ == "__main__":
    seed()