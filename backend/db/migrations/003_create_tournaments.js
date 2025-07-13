export function up(db, cb) {
  db.run(`
	CREATE TABLE IF NOT EXISTS tournaments (
	  id INTEGER PRIMARY KEY AUTOINCREMENT,
	  name VARCHAR(100) NOT NULL,
	  start_date TEXT DEFAULT CURRENT_TIMESTAMP,
	  winner INTEGER,
	  owner_id INTEGER NOT NULL,
	  max_players INTEGER,
	  status TEXT DEFAULT 'waiting',
	  FOREIGN KEY(winner) REFERENCES users(id),
	  FOREIGN KEY(owner_id) REFERENCES users(id)
	)
  `, cb);
};

export function down(db, cb) {
  db.run(`DROP TABLE IF EXISTS tournaments`, cb);
};
