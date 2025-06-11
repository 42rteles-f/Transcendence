const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./db/db.sqlite3');

db.serialize(() => {
  db.run(`
	CREATE TABLE IF NOT EXISTS tournaments (
	  id INTEGER PRIMARY KEY AUTOINCREMENT,
	  name VARCHAR(100) NOT NULL,
	  start_date TEXT DEFAULT CURRENT_TIMESTAMP,
	  end_date TEXT DEFAULT CURRENT_TIMESTAMP,
	  winner INTEGER,
	  FOREIGN KEY(winner) REFERENCES users(id)
	)
  `);
});

db.close();