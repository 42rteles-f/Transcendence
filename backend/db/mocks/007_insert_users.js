
import bcrypt from 'bcrypt';

const saltRounds = 10;
const password1 = bcrypt.hashSync('password1', saltRounds);

export function up(db, cb) {
	const query = `
		INSERT INTO users (username, password, profile_picture, mock_tag) VALUES
		(?, ?, ?, ?),
		(?, ?, ?, ?),
		(?, ?, ?, ?),
		(?, ?, ?, ?)
		`;
	db.run(query, 
		[
			'player1', password1, 'default-profile-image.png', 'test-mock',
			'player2', password1, 'default-profile-image.png', 'test-mock',
			'tester_a', password1, 'default-profile-image.png', 'test-mock',
			'tester_b', password1, 'default-profile-image.png', 'test-mock',
		]
		, cb);
}

export function down(db, cb) {
  db.run(`DELETE FROM users WHERE mock_tag = ?`, ['test-mock'], cb);
}

