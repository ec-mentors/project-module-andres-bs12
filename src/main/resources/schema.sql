DROP TABLE IF EXISTS entry CASCADE;
DROP TABLE IF EXISTS goal CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE goal (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    start_date DATE DEFAULT CURRENT_DATE,
    kcal INTEGER NOT NULL,
    carbs DECIMAL(5,2) NOT NULL,
    fat DECIMAL(5,2) NOT NULL,
    protein DECIMAL(5,2) NOT NULL,
    CONSTRAINT uk_user_goal_date UNIQUE (user_id, start_date)
);

CREATE TABLE entry (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    meal_name VARCHAR(100) NOT NULL,
    meal_type VARCHAR(20) DEFAULT 'Snack',
    source VARCHAR(50) DEFAULT 'Manual',
    created_on TIMESTAMP DEFAULT NOW(),
    kcal INTEGER NOT NULL,
    carbs DECIMAL(5,2) NOT NULL,
    fat DECIMAL(5,2) NOT NULL,
    protein DECIMAL(5,2) NOT NULL
);

-- TEST DATA --

-- USER
INSERT INTO users (first_name, last_name, email) VALUES 
('Andrés', 'Bejarano', 'andres@example.com');

-- GOAL (One per user per date)
INSERT INTO goal (user_id, start_date, kcal, carbs, fat, protein) VALUES 
(1, '2026-07-01', 2000, 200.00, 70.00, 140.00);

-- ENTRY
INSERT INTO entry (user_id, meal_name, meal_type, source, kcal, carbs, fat, protein) VALUES 
(1, 'Eggs and coffee', 'Breakfast', 'Manual', 350, 60.00, 5.00, 12.00),
(1, 'Rice and chicken', 'Lunch', 'Manual', 650, 75.00, 12.00, 55.00),
(1, 'Protein shake', 'Snack', 'Manual', 150, 3.00, 1.50, 30.00);
