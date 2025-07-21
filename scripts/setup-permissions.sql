-- Configurer les permissions (désactiver RLS pour simplifier)
ALTER TABLE game_rooms DISABLE ROW LEVEL SECURITY;
ALTER TABLE player_answers DISABLE ROW LEVEL SECURITY;
