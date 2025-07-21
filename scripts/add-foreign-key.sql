-- Ajouter la contrainte de clé étrangère après création des tables
ALTER TABLE player_answers 
ADD CONSTRAINT fk_player_answers_room_id 
FOREIGN KEY (room_id) REFERENCES game_rooms(id) ON DELETE CASCADE;
