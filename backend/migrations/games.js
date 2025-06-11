const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./db/db.sqlite3');

db.serialize(() => {
 db.run(`
	CREATE TABLE IF NOT EXISTS games (
	  id INTEGER PRIMARY KEY AUTOINCREMENT,
	  player1 INTEGER,
	  player2 INTEGER,
	  player1_score INTEGER DEFAULT 0,
	  player2_score INTEGER DEFAULT 0,
	  FOREIGN KEY(player1) REFERENCES users(id),
	  FOREIGN KEY(player2) REFERENCES users(id)
	)
  `);
});

db.close();