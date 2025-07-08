from flask import Blueprint, jsonify, request
from models import db, Workout

api = Blueprint('api', __name__)

@api.route('/api/workouts', methods=['GET'])
def get_workouts():
    workouts = Workout.query.all()
    return jsonify([{"id": w.id, "name": w.name, "duration": w.duration} for w in workouts])

@api.route('/api/workouts', methods=['POST'])
def add_workout():
    data = request.get_json()
    new_workout = Workout(name=data['name'], duration=data['duration'])
    db.session.add(new_workout)
    db.session.commit()
    return jsonify({"message": "Workout added!"}), 201
