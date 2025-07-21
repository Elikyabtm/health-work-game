-- Configurer Row Level Security (RLS)
-- Activer RLS sur les tables
ALTER TABLE game_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_answers ENABLE ROW LEVEL SECURITY;

-- Créer les politiques RLS (permettre toutes les opérations pour simplifier)
DROP POLICY IF EXISTS "Allow all operations on game_rooms" ON game_rooms;
CREATE POLICY "Allow all operations on game_rooms" ON game_rooms FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all operations on player_answers" ON player_answers;
CREATE POLICY "Allow all operations on player_answers" ON player_answers FOR ALL USING (true);
