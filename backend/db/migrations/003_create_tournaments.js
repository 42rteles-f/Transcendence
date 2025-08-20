export function up(db, cb) {
  db.run(`
	CREATE TABLE IF NOT EXISTS tournaments (
	  id INTEGER PRIMARY KEY AUTOINCREMENT,
	  uuid VARCHAR(255) UNIQUE NOT NULL,
	  name VARCHAR(100) NOT NULL,
	  start_date TEXT DEFAULT CURRENT_TIMESTAMP,
	  winner INTEGER,
	  owner_id INTEGER NOT NULL,
	  number_of_players INTEGER NOT NULL,
	  status TEXT DEFAULT 'waiting',
	  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
	  end_date TEXT,
	  number_of_rounds INTEGER DEFAULT 0,
	  current_round INTEGER DEFAULT 0,
	  FOREIGN KEY(winner) REFERENCES users(id),
	  FOREIGN KEY(owner_id) REFERENCES users(id)
	)
  `, cb);
};

export function down(db, cb) {
  db.run(`DROP TABLE IF EXISTS tournaments`, cb);
};
