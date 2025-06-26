export function up(db, cb) {
  db.run(`ALTER TABLE users ADD COLUMN email VARCHAR(255)`, err => {
    if (err && !/duplicate column/.test(err.message)) return cb(err);
    db.run(`ALTER TABLE users ADD COLUMN google_id VARCHAR(64)`, err2 => {
      if (err2 && !/duplicate column/.test(err2.message)) return cb(err2);
      db.run(`CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email)`, err3 => {
        if (err3) return cb(err3);
        cb();
      });
    });
  });
}

export function down(db, cb) {
  db.run(`DROP INDEX IF EXISTS idx_users_email`, () => cb());
}