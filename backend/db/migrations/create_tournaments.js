module.exports.up = function(db, cb) {
  return db.run(`
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

module.exports.down = function(db, cb) {
  return db.run(`DROP TABLE IF EXISTS tournaments`, cb);
};
