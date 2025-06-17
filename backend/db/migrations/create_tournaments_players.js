module.exports.up = function(db, cb) {
  return db.run(`
	CREATE TABLE IF NOT EXISTS tournament_players (
	  id INTEGER PRIMARY KEY AUTOINCREMENT,
	  tournament_id INTEGER,
	  player_id INTEGER,
	  FOREIGN KEY(tournament_id) REFERENCES tournaments(id),
	  FOREIGN KEY(player_id) REFERENCES users(id)
	)
  `, cb);
};

module.exports.down = function(db, cb) {
  return db.run(`DROP TABLE IF EXISTS tournament_players`, cb);
};
