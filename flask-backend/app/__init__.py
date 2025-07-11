# Import the 'Flask' class from the 'flask' library.
from flask import Flask
from app.db import close_db
from flask_cors import CORS # Import CORS module for CORS functionality

def create_app():
    app = Flask(__name__)
    
    # Configuration
    app.config['DATABASE_URI'] = 'postgresql://neondb_owner:npg_FCdSrvGW6K0c@ep-calm-dream-a1dagoq9-pooler.ap-southeast-1.aws.neon.tech/fitness_db?sslmode=require'
    CORS(app)

    # Import and register blueprints for routes
    from app.routes import api_blueprint   # Import Blueprint from Flask in Routes
    from app.routes import workout_blueprint  # Import Blueprint from Flask in Routes
    app.register_blueprint(api_blueprint)
    app.register_blueprint(workout_blueprint)
    
    app.teardown_appcontext(close_db)
    
    return app