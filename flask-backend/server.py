from flask import Flask
from models import db   # Import SQLAlchemy from db variable in Models 
from routes import api  # Import Blueprint from Flask in Routes

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql+psycopg://neondb_owner:npg_FCdSrvGW6K0c@ep-calm-dream-a1dagoq9-pooler.ap-southeast-1.aws.neon.tech/fitness_db?sslmode=require'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)  # For binding db to the app when SQLAlchemy is declared in a separate file

# Register Blueprint
app.register_blueprint(api)

with app.app_context():
    db.create_all()  # Creates all tables if they don't exist in db

if __name__ == '__main__':
    app.run(debug=True)