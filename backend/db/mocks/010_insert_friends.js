export function up(db, cb) {
	db.run(`
		INSERT INTO friend_requests (user_id, friend_id, requester_id, status) VALUES
		(1, 2, 1, 'accepted'),
		(1, 3, 1, 'accepted'),
		(4, 1, 4, 'accepted'),
		(2, 3, 2, 'accepted'),
		(3, 4, 3, 'accepted'),
		(2, 4, 4, 'accepted')
	`, cb);
}

export function down(db, cb) {
	db.run(`
		DELETE FROM friend_requests WHERE (user_id, friend_id) IN ((1, 2), (1, 3), (4, 1), (2, 3), (3, 4), (2, 4))
	`, cb);
}