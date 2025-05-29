import fp from 'fastify-plugin';
import type { Knex } from 'knex';
import knex from 'knex';
import { FastifyInstance } from 'fastify';

declare module 'fastify' {
  interface FastifyInstance {
    knex: Knex;
  }
}

function knexPlugin(fastify: FastifyInstance, options: Knex.Config, done: (err?: Error) => void) {
	if (!fastify.knex) {
		const knexInstance = knex(options);
	
		knexInstance.raw('PRAGMA foreign_keys = ON;').then(() => {
			fastify.decorate('knex', knexInstance);

			fastify.addHook('onClose', (fastifyInstance, done) => {
			if (fastifyInstance.knex === knexInstance)
				fastifyInstance.knex.destroy().then(() => done());
			else
				done();
			});

			done();
		});
	} else
		done();
}

export default fp(knexPlugin, { name: 'fastify-knex-sqlite' });