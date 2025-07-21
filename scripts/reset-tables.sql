-- ATTENTION: Ceci supprime toutes les données existantes
DROP TABLE IF EXISTS player_answers;
DROP TABLE IF EXISTS game_rooms;

-- Recréer les tables
CREATE TABLE game_rooms (
  id TEXT PRIMARY KEY,
  config JSONB,
  players JSONB DEFAULT '[]',
  current_round INTEGER DEFAULT 1,
  current_keyword TEXT DEFAULT '',
  expected_words JSONB DEFAULT '[]',
  round_results JSONB DEFAULT '[]',
  game_finished BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE player_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id TEXT,
  player_id TEXT,
  player_name TEXT,
  round INTEGER,
  words JSONB DEFAULT '[]',
  submitted_at TIMESTAMP DEFAULT NOW()
);

-- Désactiver RLS
ALTER TABLE game_rooms DISABLE ROW LEVEL SECURITY;
ALTER TABLE player_answers DISABLE ROW LEVEL SECURITY;
