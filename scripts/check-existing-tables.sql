-- Vérifier quelles tables existent déjà
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('game_rooms', 'player_answers');
