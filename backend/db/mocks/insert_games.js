import sqlite3 from 'sqlite3';
const db = new sqlite3.Database('./db/db.sqlite3');

function up(db, cb) {
	return db.run(`
		INSERT INTO games (player1, player2, player1_score, player2_score, status) VALUES
		(1, 2, 5, 11, 'finished'),
		(1, 2, 11, 7, 'finished'),
		(2, 1, 6, 11, 'finished'),
		(2, 1, 11, 3, 'finished'),
		(3, 4, 11, 5, 'finished'),
		(4, 3, 11, 10, 'finished'),
		(3, 4, 7, 11, 'finished')`, cb);
}

function down(db, cb) {
	return db.run(`
		DELETE FROM games WHERE (player1, player2) IN ((1, 2), (2, 1), (3, 4), (4, 3)) AND
		(player1_score, player2_score) IN ((5, 11), (11, 7), (6, 11), (11, 3), (11, 5), (11, 10), (7, 11))`, cb);
}

const action = process.argv[2];

if (!['up', 'down'].includes(action)) {
	console.log('Usage: node insert_games.js up|down');
	process.exit(1);
}

if (action === 'up') {
	up(db, err => {
		if (err) {
			console.error('Error inserting games:', err);
		} else {
			console.log('Games inserted successfully.');
		}
		db.close();
	});
}
else if (action === 'down') {
	down(db, err => {
		if (err) {
			console.error('Error deleting games:', err);
		} else {
			console.log('Games deleted successfully.');
		}
		db.close();
	});
}
