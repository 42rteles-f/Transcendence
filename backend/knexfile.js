module.exports = {
	development: {
		client: 'sqlite3',
		connection: {
			filename: './db/db.sqlite3'
		},
		useNullAsDefault: true,
		migrations: {
			directory: './migrations',
			extension: 'js'
		}
	}
};