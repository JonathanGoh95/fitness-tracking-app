# Import the 'Flask' class from the 'flask' library.
from flask import Flask
from app.db import close_db
from flask_cors import CORS # Import CORS module for CORS functionality
from dotenv import load_dotenv
load_dotenv()
import os

def create_app():
    app = Flask(__name__)
    
    # Configuration
    app.config['DATABASE_URI'] = os.getenv('POSTGRES_URL')
    CORS(app, origins=["https://fittrack-fitness-app.netlify.app"])

    # Import and register blueprints for routes
    from app.routes import api_blueprint   # Import Blueprint from Flask in Routes
    from app.routes import workout_blueprint  # Import Blueprint from Flask in Routes
    from app.routes import user_blueprint  # Import Blueprint from Flask in Routes
    app.register_blueprint(api_blueprint)
    app.register_blueprint(workout_blueprint)
    app.register_blueprint(user_blueprint)
    
    app.teardown_appcontext(close_db)
    
    return app