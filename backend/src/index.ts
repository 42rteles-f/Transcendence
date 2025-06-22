import Fastify from 'fastify';
import type { FastifyRequest, FastifyReply } from 'fastify';
import fastifyMultipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import sqlitePlugin from './custom-plugins/sqlite';
import jwt from 'jsonwebtoken';
import cors from '@fastify/cors';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const server = Fastify({
	logger: false,
	bodyLimit: 1048576
});


server.register(cors, {
	origin: "http://localhost:5173",
	credentials: true,
});

server.register(fastifyMultipart);

server.register(fastifyStatic, {
	root: path.join(__dirname, '../uploads'),
	prefix: '/uploads/',
});

console.log("DB_PATH:", process.env.DB_PATH);
server.register(sqlitePlugin, {
    filename: String('./db/db.sqlite3'),
});

server.decorate('authenticate', async function (req: FastifyRequest, res: FastifyReply) {
	const authHeader = req.headers['authorization'];
  
	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		res.status(401).send({ error: 'Unauthorized' })
		return ;
	}

	const token = authHeader.substring(7);
	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET!)
		if (typeof decoded === "object" &&
			decoded !== null &&
			"id" in decoded &&
			"username" in decoded &&
			typeof decoded.id === "number" &&
			typeof decoded.username === "string")
				(req as any).user = decoded as { id: number, username: string }
		else {
			res.status(401).send({ error: 'Unauthorized' })
			return ;
		}
	} catch (err) {
		res.status(401).send({ error: 'Unauthorized' });
		return ;
	}
});


server.get("/", async (req, res) => {
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

const port = Number(process.env.PORT) || 3000;

start(port);
