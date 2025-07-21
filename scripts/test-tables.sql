-- Tester que tout fonctionne
INSERT INTO game_rooms (id, config, players) 
VALUES ('TEST123', '{"theme": "test"}', '[{"id": "1", "name": "Test"}]');

SELECT * FROM game_rooms WHERE id = 'TEST123';

-- Nettoyer le test
DELETE FROM game_rooms WHERE id = 'TEST123';
