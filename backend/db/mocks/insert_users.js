import sqlite3 from 'sqlite3';
const db = new sqlite3.Database('./db/db.sqlite3');
import bcrypt from 'bcrypt';

const saltRounds = 10;
const password1 = bcrypt.hashSync('password1', saltRounds);
const password2 = bcrypt.hashSync('password2', saltRounds);
const password3 = bcrypt.hashSync('password3', saltRounds);
const password4 = bcrypt.hashSync('password4', saltRounds);

function up(db, cb) {
	return db.run(`
		INSERT INTO users (username, nickname, password, profile_picture) VALUES
		('player1', 'gamer', '${password1}', 'default-profile-image.png'),
		('player2', 'non gamer', '${password2}', 'default-profile-image.png'),
		('tester_a', 'somebody that I used to know', '${password3}', 'default-profile-image.png'),
		('tester_t', 'somebody that I did not use to know', '${password4}', 'default-profile-image.png')`, cb);
}

function down(db, cb) {
	return db.run(`
		DELETE FROM users WHERE id IN (1, 2, 3, 4)`, cb);
}

const action = process.argv[2];

if (!['up', 'down'].includes(action)) {
	console.log('Usage: node insert_users.js up|down');
	process.exit(1);
}

if (action === 'up') {
	up(db, err => {
		if (err) {
			console.error('Error inserting users:', err);
		} else {
			console.log('Users inserted successfully.');
		}
		db.close();
	});
}
else if (action === 'down') {
	down(db, err => {
		if (err) {
			console.error('Error deleting users:', err);
		} else {
			console.log('Users deleted successfully.');
		}
		db.close();
	});
}
