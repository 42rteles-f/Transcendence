module.exports.up = function(db, cb) {
  return db.run(
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username VARCHAR(50) NOT NULL UNIQUE,
      nickname VARCHAR(50) NOT NULL,
      password VARCHAR(255) NOT NULL,
	  profile_picture VARCHAR(255) DEFAULT 'default-profile-image.png',
	  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`
  ), cb;
};

module.exports.down = function(db, cb) {
  return db.run(`DROP TABLE IF EXISTS users`, cb);
};