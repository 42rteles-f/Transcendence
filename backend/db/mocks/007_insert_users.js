
import bcrypt from 'bcrypt';

const saltRounds = 10;
const password1 = bcrypt.hashSync('password1', saltRounds);
const password2 = bcrypt.hashSync('password2', saltRounds);
const password3 = bcrypt.hashSync('password3', saltRounds);
const password4 = bcrypt.hashSync('password4', saltRounds);

export function up(db, cb) {
	const query = `
		INSERT INTO users (username, nickname, password, profile_picture, mock_tag) VALUES
		(?, ?, ?, ?, ?),
		(?, ?, ?, ?, ?),
		(?, ?, ?, ?, ?),
		(?, ?, ?, ?, ?)
		`;
	db.run(query, 
		[
			'player1', 'Player One', password1, 'default-profile-image.png', 'test-mock',
			'player2', 'Player Two', password2, 'default-profile-image.png', 'test-mock',
			'tester_a', 'Tester A', password3, 'default-profile-image.png', 'test-mock',
			'tester_t', 'Tester T', password4, 'default-profile-image.png', 'test-mock'
		]
		, cb);
}

export function down(db, cb) {
  db.run(`DELETE FROM users WHERE mock_tag = ?`, ['test-mock'], cb);
}

