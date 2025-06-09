import fp from 'fastify-plugin';
import sqlite3 from 'sqlite3';
import { FastifyInstance } from 'fastify';

export default fp(async (fastify: FastifyInstance, options: any) => {
	const db = new sqlite3.Database(options.filename || '../../db/db.sqlite3');
	fastify.decorate('sqlite', db);

	fastify.addHook('onClose', (instance, done) => {
		db.close((err) => done(err ?? undefined));
	});
});
