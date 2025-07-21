-- Créer seulement les tables manquantes
CREATE TABLE IF NOT EXISTS player_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id TEXT,
  player_id TEXT,
  player_name TEXT,
  round INTEGER,
  words JSONB DEFAULT '[]',
  submitted_at TIMESTAMP DEFAULT NOW()
);
