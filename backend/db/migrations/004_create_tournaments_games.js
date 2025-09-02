export function up(db, cb) {
	db.run(`
	CREATE TABLE IF NOT EXISTS tournament_games (
	  id INTEGER PRIMARY KEY AUTOINCREMENT,
	  tournament_id INTEGER,
	  tournament_uuid VARCHAR(255) NOT NULL,
	  game_id INTEGER,
	  FOREIGN KEY(tournament_id) REFERENCES tournaments(id),
	  FOREIGN KEY(game_id) REFERENCES games(id)
	)
  `, cb);
}

export function down(db, cb) {
	db.run(`DROP TABLE IF EXISTS tournament_games`, cb);
}
