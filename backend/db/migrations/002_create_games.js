export function up(db, cb) {
  db.run(`
	CREATE TABLE IF NOT EXISTS games (
	  id INTEGER PRIMARY KEY AUTOINCREMENT,
	  player1 INTEGER,
	  player2 INTEGER,
	  player1_score INTEGER DEFAULT 0,
	  player2_score INTEGER DEFAULT 0,
	  status TEXT DEFAULT 'waiting', -- 'waiting', 'in_progress', 'finished'
	  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	  FOREIGN KEY(player1) REFERENCES users(id),
	  FOREIGN KEY(player2) REFERENCES users(id)
	)
  `, cb);
};

export function down(db, cb) {
  db.run(`DROP TABLE IF EXISTS games`, cb);
}
