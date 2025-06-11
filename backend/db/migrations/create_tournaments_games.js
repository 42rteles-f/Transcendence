module.exports.up = function(db, cb) {
  return db.run(`
	CREATE TABLE IF NOT EXISTS tournament_games (
	  id INTEGER PRIMARY KEY AUTOINCREMENT,
	  tournament_id INTEGER,
	  game_id INTEGER,
	  FOREIGN KEY(tournament_id) REFERENCES tournaments(id),
	  FOREIGN KEY(game_id) REFERENCES games(id)
	)
  `, cb);
}

module.exports.down = function(db, cb) {
	return db.run(`DROP TABLE IF EXISTS tournament_games`, cb);
}
