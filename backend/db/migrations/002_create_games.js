export function up(db, cb) {
  db.run(`
	CREATE TABLE IF NOT EXISTS games (
	  id INTEGER PRIMARY KEY AUTOINCREMENT,
	  player1_id INTEGER,
	  player2_id INTEGER,
	  player1_score INTEGER DEFAULT 0,
	  player2_score INTEGER DEFAULT 0,
	  winner_id INTEGER,
	  status TEXT DEFAULT 'waiting', -- 'waiting', 'in_progress', 'finished'
	  round INTEGER,
	  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	  FOREIGN KEY(player1_id) REFERENCES users(id),
	  FOREIGN KEY(player2_id) REFERENCES users(id),
	  FOREIGN KEY(winner_id) REFERENCES users(id)
	)
  `, cb);
};

export function down(db, cb) {
  db.run(`DROP TABLE IF EXISTS games`, cb);
}
