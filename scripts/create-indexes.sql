-- Créer les index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_game_rooms_id ON game_rooms(id);
CREATE INDEX IF NOT EXISTS idx_player_answers_room_round ON player_answers(room_id, round);
CREATE INDEX IF NOT EXISTS idx_game_rooms_updated ON game_rooms(updated_at);
