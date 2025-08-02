import Fastify from 'fastify';
import type { FastifyRequest, FastifyReply } from 'fastify';
import fastifyMultipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import sqlitePlugin from './custom-plugins/sqlite';
import jwt from 'jsonwebtoken';
import cors from '@fastify/cors';
import dotenv from 'dotenv';
import path from 'path';
import googleAuthRoutes from './routes/googleAuth';
import { Database } from 'sqlite3';
import TournamentDatabase from './database/tournament';


dotenv.config();

export const server = Fastify({
	logger: false,
	bodyLimit: 1048576
});

server.register(cors, {
	origin: "*",
	credentials: true,
});

server.register(fastifyMultipart);

server.register(fastifyStatic, {
	root: path.join(__dirname, '../uploads'),
	prefix: '/uploads/',
});

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

server.register(googleAuthRoutes)

const start = async (port: number) => {
	try {
		console.log("starting server...");
		await server.listen({ port, host: "0.0.0.0" })
		console.log(`Server is running at port ${port}`);

		const db = server.sqlite as Database;
        const database = new TournamentDatabase(db);
        try {
            await database.closeInProgressEntities();
        } catch (error: Error | any) {
            console.error(`Error closing running games: ${error.message}`);
        }
	} catch (err) {
		server.log.error(err);
	}
};
const httpServer = server.server;
const dbLite = server.sqlite;

export { httpServer };
export { dbLite };

import "./routes/user";
import "./routes/tournament";
import "./socket/setup";
import { Tournament } from './services/Tournament/Tournament';
import os from 'os';

const port = Number(process.env.PORT) || 3000;

function getLocalIpAddress(): string | undefined {
	const interfaces = os.networkInterfaces();
	for (const name of Object.keys(interfaces)) {
		for (const iface of interfaces[name]!) {
			if (iface.family === 'IPv4' && !iface.internal) {
				return iface.address;
			}
		}
	}
	return undefined;
}

const localIp = getLocalIpAddress();
console.log(`Machine local IP address: ${localIp ?? 'Not found'}`);

start(port);

