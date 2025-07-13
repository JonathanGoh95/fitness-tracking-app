import psycopg
from flask import current_app, g

# Establish Database Connection globally
def get_db():
    if 'db' not in g:
        g.db = psycopg.connect(current_app.config['DATABASE_URI'])
    return g.db

# Close (Pop) Database Connection globally
def close_db(e=None):
    db = g.pop('db', None)
    if db is not None:
        db.close()
