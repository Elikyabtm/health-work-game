-- Créer les tables nécessaires pour le multijoueur

-- Table des parties/rooms
CREATE TABLE IF NOT EXISTS game_rooms (
  id TEXT PRIMARY KEY,
  config JSONB NOT NULL,
  players JSONB NOT NULL DEFAULT '[]',
  current_round INTEGER DEFAULT 1,
  current_keyword TEXT DEFAULT '',
  expected_words JSONB DEFAULT '[]',
  round_results JSONB DEFAULT '[]',
  game_finished BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des réponses des joueurs
CREATE TABLE IF NOT EXISTS player_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id TEXT REFERENCES game_rooms(id) ON DELETE CASCADE,
  player_id TEXT NOT NULL,
  player_name TEXT NOT NULL,
  round INTEGER NOT NULL,
  words JSONB NOT NULL DEFAULT '[]',
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_game_rooms_id ON game_rooms(id);
CREATE INDEX IF NOT EXISTS idx_player_answers_room_round ON player_answers(room_id, round);

-- Activer RLS (Row Level Security)
ALTER TABLE game_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_answers ENABLE ROW LEVEL SECURITY;

-- Politiques RLS (permettre à tous de lire/écrire pour simplifier)
CREATE POLICY IF NOT EXISTS "Allow all operations on game_rooms" ON game_rooms FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS "Allow all operations on player_answers" ON player_answers FOR ALL USING (true);
