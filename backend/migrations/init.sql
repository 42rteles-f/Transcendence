CREATE TABLE users (
	id SERIAL PRIMARY KEY,
	username VARCHAR(50) NOT NULL UNIQUE,
	password VARCHAR(255) NOT NULL
);

CREATE TABLE games (
	id SERIAL PRIMARY KEY,
	player1 INT REFERENCES users(id),
	player2 INT REFERENCES users(id),
	player1_score INT DEFAULT 0,
	player2_score INT DEFAULT 0
);

CREATE TABLE tournaments (
	id SERIAL PRIMARY KEY,
	name VARCHAR(100) NOT NULL,
	start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	end_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	winner INT REFERENCES users(id)
);

CREATE TABLE tournament_players (
	id SERIAL PRIMARY KEY,
	tournament_id INT REFERENCES tournaments(id),
	player_id INT REFERENCES users(id)
);

CREATE TABLE tournament_games (
	id SERIAL PRIMARY KEY,
	tournament_id INT REFERENCES tournaments(id),
	game_id INT REFERENCES games(id)
);
