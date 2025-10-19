
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX IF NOT EXISTS idx_relationships_created_at ON relationships(created_at);
CREATE INDEX IF NOT EXISTS idx_users_hobbies ON users USING GIN(hobbies);


INSERT INTO hobbies (name) VALUES 
('reading'), ('gaming'), ('sports'), ('music'), ('cooking'),
('traveling'), ('photography'), ('painting'), ('dancing'), ('hiking')
ON CONFLICT (name) DO NOTHING;


INSERT INTO users (username, age, hobbies, popularity_score) VALUES 
('Alice', 25, '{"reading", "gaming"}', 0),
('Bob', 30, '{"sports", "music"}', 0),
('Charlie', 28, '{"cooking", "traveling"}', 0),
('Diana', 22, '{"photography", "painting"}', 0)
ON CONFLICT (username) DO NOTHING;