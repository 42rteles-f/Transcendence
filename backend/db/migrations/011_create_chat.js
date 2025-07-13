export function up(db, cb) {
	db.run(`
		CREATE TABLE IF NOT EXISTS chat (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			sender_id INTEGER NOT NULL,
			receiver_id INTEGER NOT NULL,
			message TEXT NOT NULL,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY(sender_id) REFERENCES users(id),
            FOREIGN KEY(receiver_id) REFERENCES users(id)
		)
	`, err => {
		if (err) return cb(err);
		cb();
	});
}

export function down(db, cb) {
    db.run(`DROP TABLE IF EXISTS chat`, cb);
}