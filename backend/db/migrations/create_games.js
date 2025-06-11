module.exports.up = function(db, cb) {
  return db.run(`
	CREATE TABLE IF NOT EXISTS games (
	  id INTEGER PRIMARY KEY AUTOINCREMENT,
	  player1 INTEGER,
	  player2 INTEGER,
	  player1_score INTEGER DEFAULT 0,
	  player2_score INTEGER DEFAULT 0,
	  FOREIGN KEY(player1) REFERENCES users(id),
	  FOREIGN KEY(player2) REFERENCES users(id)
	)
  `, cb);
};

module.exports.down = function(db, cb) {
  return db.run(`DROP TABLE IF EXISTS games`, cb);
}
