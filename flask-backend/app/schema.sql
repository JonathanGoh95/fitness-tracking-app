CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    user_weight NUMERIC(5,2) NOT NULL,
    user_role VARCHAR(10) NOT NULL DEFAULT 'user'
);

CREATE TABLE category_types (
    id SERIAL PRIMARY KEY,
    category_name VARCHAR(50) NOT NULL
);

CREATE TABLE workout_types (
    id SERIAL PRIMARY KEY,
    workout_name VARCHAR(50) NOT NULL,
    met_value NUMERIC(5,2) NOT NULL DEFAULT 5.00,
    category_id INTEGER NOT NULL REFERENCES category_types(id)
);

CREATE TABLE workouts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    workout_type_id INTEGER NOT NULL REFERENCES workout_types(id),
    duration_mins INTEGER NOT NULL,
    calories_burned INTEGER NOT NULL,
    workout_date DATE NOT NULL
);