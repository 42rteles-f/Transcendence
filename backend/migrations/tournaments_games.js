const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./db/db.sqlite3');

db.serialize(() => {
   db.run(`
    CREATE TABLE IF NOT EXISTS tournament_games (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tournament_id INTEGER,
      game_id INTEGER,
      FOREIGN KEY(tournament_id) REFERENCES tournaments(id),
      FOREIGN KEY(game_id) REFERENCES games(id)
    )
  `);
});

db.close();