const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./db/db.sqlite3');

db.serialize(() => {
   db.run(`
	 CREATE TABLE IF NOT EXISTS tournament_players (
	   id INTEGER PRIMARY KEY AUTOINCREMENT,
	   tournament_id INTEGER,
	   player_id INTEGER,
	   FOREIGN KEY(tournament_id) REFERENCES tournaments(id),
	   FOREIGN KEY(player_id) REFERENCES users(id)
	 )
   `);
});

db.close();