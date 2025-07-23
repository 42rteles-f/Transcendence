export function up(db, cb) {
  db.run(`
	CREATE TABLE IF NOT EXISTS tournament_players (
	  id INTEGER PRIMARY KEY AUTOINCREMENT,
	  tournament_id INTEGER,
	  player_id INTEGER,
	  display_name TEXT NOT NULL,
	  FOREIGN KEY(tournament_id) REFERENCES tournaments(id),
	  FOREIGN KEY(player_id) REFERENCES users(id)
	)
  `, cb);
};

export function down(db, cb) {
	db.run(`DROP TABLE IF EXISTS tournament_players`, cb);
};
