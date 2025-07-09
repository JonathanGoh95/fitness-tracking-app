# Import the 'Flask' class from the 'flask' library.
from flask import Flask, jsonify, request, g
# To enable access of .env file
from dotenv import load_dotenv
import os
load_dotenv()
import jwt
# For password hashing, similar concept to Express
import bcrypt
from app.models import db   # Import SQLAlchemy from db variable in Models 
from flask_cors import CORS # Import CORS module for CORS functionality

def create_app():
    app = Flask(__name__)
    
    # Configuration
    app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql+psycopg://neondb_owner:npg_FCdSrvGW6K0c@ep-calm-dream-a1dagoq9-pooler.ap-southeast-1.aws.neon.tech/fitness_db?sslmode=require'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # Initialize extensions
    db.init_app(app)
    CORS(app)

    # Import and register blueprints for routes
    from app.routes import api_blueprint   # Import Blueprint from Flask in Routes
    app.register_blueprint(api_blueprint)

    return app