import Fastify from 'fastify';
import FastifyPostgres from '@fastify/postgres';
import cors from '@fastify/cors';

export const server = Fastify({
	logger: false,
	bodyLimit: 1048576
});

server.register(cors, {
	origin: true
});

server.register(FastifyPostgres, {
	host: process.env.DB_HOST,
	port: Number(process.env.DB_PORT),
	database: process.env.DB_NAME,
	user: process.env.USER,
	password: process.env.PASSWORD,
}).after((err) => {
	if (err) {
		server.log.error(err);
		process.exit(1);
	} else {
		server.log.info('Postgres connected');
	}
});

server.decorate('authenticate', async function (request: any, reply: any) {
	// const authHeader = request.headers['authorization']
  
	// if (!authHeader || authHeader !== 'Bearer secrettoken123') {
	//   reply.code(401).send({ error: 'Unauthorized' })
	// }
});


server.get("/", async (req, res) => {
	console.log("root being hit");
	res.send({ ok: true });
});

const start = async (port: number) => {
	try {
		console.log("starting server...");
		await server.listen({ port, host: "0.0.0.0" })
		console.log(`Server is running at port ${port}`);
	} catch (err) {
		server.log.error(err);
	}
};
const httpServer = server.server;

export { httpServer };

import "./routes/user";
import "./socket/setup";
import loginRoutes from './routes/login';
server.register(loginRoutes);

const port = 3000;
// const port = Number(process.env.PORT);

start(port);
