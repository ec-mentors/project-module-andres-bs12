DROP TABLE IF EXISTS favorite_meal CASCADE;
DROP TABLE IF EXISTS entry CASCADE;
DROP TABLE IF EXISTS goal CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS daily_ai_usage CASCADE;

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    google_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    role VARCHAR(50) DEFAULT 'USER' NOT NULL,
    telegram_chat_id BIGINT UNIQUE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE goal (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    start_date DATE DEFAULT CURRENT_DATE,
    kcal INTEGER NOT NULL,
    carbs DECIMAL(5,2) NOT NULL,
    fat DECIMAL(5,2) NOT NULL,
    protein DECIMAL(5,2) NOT NULL,
    CONSTRAINT uk_user_goal_date UNIQUE (user_id, start_date)
);

CREATE TABLE entry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    meal_name VARCHAR(100) NOT NULL,
    source VARCHAR(50) DEFAULT 'Manual',
    created_on TIMESTAMP DEFAULT NOW(),
    kcal INTEGER NOT NULL,
    carbs DECIMAL(5,2) NOT NULL,
    fat DECIMAL(5,2) NOT NULL,
    protein DECIMAL(5,2) NOT NULL,
    meal_type VARCHAR(50)
);

CREATE TABLE daily_ai_usage
(
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID    NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
    goals_used      INTEGER NOT NULL DEFAULT 0,
    favorites_used INTEGER NOT NULL DEFAULT 0,
    entries_used   INTEGER NOT NULL DEFAULT 0,
--   Security, makes sure there is just une register per user per day
    CONSTRAINT uk_user_daily_usage UNIQUE (user_id, usage_date)
);
CREATE INDEX idx_daily_ai_usage_lookup ON daily_ai_usage(users_id, usage_date);

CREATE TABLE favorite_meal (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    meal_name VARCHAR(100) NOT NULL,
    kcal INTEGER NOT NULL,
    carbs DECIMAL(5,2) NOT NULL,
    fat DECIMAL(5,2) NOT NULL,
    protein DECIMAL(5,2) NOT NULL,
    meal_type VARCHAR(50),
    created_at DATE DEFAULT CURRENT_DATE
);

-- SEED DATA FOR LOCAL DEVELOPMENT --

INSERT INTO users (id, google_id, first_name, last_name, email, role) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'google-uid-123456', 'Andrés', 'Bejarano', 'andres@example.com', 'ADMIN');

INSERT INTO goal (user_id, start_date, kcal, carbs, fat, protein) VALUES 
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', CURRENT_DATE, 2000, 200.00, 70.00, 140.00);

INSERT INTO entry (user_id, meal_name, source, kcal, carbs, fat, protein, meal_type) VALUES 
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Eggs and coffee', 'Manual', 350, 60.00, 5.00, 12.00, 'BREAKFAST'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Rice and chicken', 'Manual', 650, 75.00, 12.00, 55.00, 'LUNCH'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Protein shake', 'Manual', 150, 3.00, 1.50, 30.00, 'SNACK');

INSERT INTO favorite_meal (user_id, meal_name, kcal, carbs, fat, protein, meal_type) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Chicken and Broccoli', 450, 20.00, 8.00, 65.00, 'DINNER');

