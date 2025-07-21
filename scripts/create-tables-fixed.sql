-- Créer les tables nécessaires pour le multijoueur
-- Version corrigée pour Supabase

-- Table des parties/rooms
CREATE TABLE IF NOT EXISTS game_rooms (
  id TEXT PRIMARY KEY,
  config JSONB NOT NULL,
  players JSONB NOT NULL DEFAULT '[]'::jsonb,
  current_round INTEGER DEFAULT 1,
  current_keyword TEXT DEFAULT '',
  expected_words JSONB DEFAULT '[]'::jsonb,
  round_results JSONB DEFAULT '[]'::jsonb,
  game_finished BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
