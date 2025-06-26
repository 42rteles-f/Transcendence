export function up(db, cb) {
	db.run(
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username VARCHAR(50) NOT NULL UNIQUE,
      nickname VARCHAR(50) NOT NULL,
      password VARCHAR(255),
	  profile_picture VARCHAR(255) DEFAULT 'default-profile-image.png',
	  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	  mock_tag VARCHAR(50)
    )`
  , cb);
};

export function down(db, cb) {
  db.run(`DROP TABLE IF EXISTS users`, cb);
};