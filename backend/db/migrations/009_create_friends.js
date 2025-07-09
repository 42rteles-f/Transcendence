export function up(db, cb) {
  db.run(`
	CREATE TABLE IF NOT EXISTS friend_requests (
	  id INTEGER PRIMARY KEY AUTOINCREMENT,
	  user_id INTEGER NOT NULL,
	  friend_id INTEGER NOT NULL,
	  requester_id INTEGER NOT NULL,
	  status TEXT NOT NULL,
	  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	  UNIQUE(user_id, friend_id)
	)
  `, err => {
	if (err) return cb(err);
	db.run(`CREATE UNIQUE INDEX IF NOT EXISTS idx_friends_user_friend ON friend_requests(user_id, friend_id)`, cb);
  });
}

export function down(db, cb) {
  db.run(`DROP TABLE IF EXISTS friend_requests`, err => {
	if (err) return cb(err);
	db.run(`DROP INDEX IF EXISTS idx_friends_user_friend`, cb);
  });
}