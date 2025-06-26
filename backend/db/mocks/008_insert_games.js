export function up(db, cb) {
	db.run(`
		INSERT INTO games (player1, player2, player1_score, player2_score, status) VALUES
		(1, 2, 5, 11, 'finished'),
		(1, 2, 11, 7, 'finished'),
		(2, 1, 6, 11, 'finished'),
		(2, 1, 11, 3, 'finished'),
		(3, 4, 11, 5, 'finished'),
		(4, 3, 11, 10, 'finished'),
		(3, 4, 7, 11, 'finished')`, cb);
}

export function down(db, cb) {
	db.run(`
		DELETE FROM games WHERE (player1, player2) IN ((1, 2), (2, 1), (3, 4), (4, 3)) AND
		(player1_score, player2_score) IN ((5, 11), (11, 7), (6, 11), (11, 3), (11, 5), (11, 10), (7, 11))`, cb);
}
