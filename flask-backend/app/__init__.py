from flask import Flask
from models import db   # Import SQLAlchemy from db variable in Models 
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    
    # Configuration
    app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://user:password@hostname/dbname'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # Initialize extensions
    db.init_app(app)
    CORS(app)

    # Import and register blueprints
    from app.routes import api_blueprint   # Import Blueprint from Flask in Routes
    app.register_blueprint(api_blueprint)  # No /api prefix if you don't want

    return app