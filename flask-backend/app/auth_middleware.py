# Middleware for decoding token and will be included in each route that checks for a signed-in user
from functools import wraps
from flask import request, jsonify
import jwt
import os

def token_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        authorization_header = request.headers.get('Authorization')
        if authorization_header is None:
            return jsonify({"err": "Unauthorized"}), 401
        try:
            token = authorization_header.split(' ')[1]
            token_data = jwt.decode(token, os.getenv('JWT_SECRET'), algorithms=["HS256"])
            current_user = token_data
        except Exception as err:
            return jsonify({"err": str(err)}), 500
        return f(current_user, *args, **kwargs)
    return decorated_function
