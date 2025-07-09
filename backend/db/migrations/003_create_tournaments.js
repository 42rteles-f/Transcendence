export function up(db, cb) {
  db.run(`
	CREATE TABLE IF NOT EXISTS tournaments (
	  id INTEGER PRIMARY KEY AUTOINCREMENT,
	  name VARCHAR(100) NOT NULL,
	  start_date TEXT DEFAULT CURRENT_TIMESTAMP,
	  end_date TEXT DEFAULT CURRENT_TIMESTAMP,
	  winner INTEGER,
	  FOREIGN KEY(winner) REFERENCES users(id)
	)
  `, cb);
};

export function down(db, cb) {
  db.run(`DROP TABLE IF EXISTS tournaments`, cb);
};
