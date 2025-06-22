import { FastifyReply, FastifyRequest } from 'fastify';
import IResponse from '../interfaces/user';
import UserService from '../services/user';
import { Database } from 'sqlite3';
import fs from 'fs';
import path from 'path';

declare module 'fastify' {
  interface FastifyInstance {
    sqlite: Database;
  }
}

class UserController {
	constructor () {
	}

	async register(req: FastifyRequest, _res: FastifyReply): Promise<IResponse> {
		const db = req.server.sqlite as Database;
		const service = new UserService(db);
	
		const { username, nickname, password } = req.body as { username: string, nickname: string, password: string };
		const { status, reply } = await service.register(username, nickname, password);
		return { status, reply };
	}

	async login(req: FastifyRequest, _res: FastifyReply): Promise<IResponse> {
		const db = req.server.sqlite as Database;
		const service = new UserService(db);
		
		const { username, password } = req.body as { username: string, password: string };
		const { status, reply } = await service.login(username, password);
		return { status, reply };
	}

	async updateProfile(req: FastifyRequest, _res: FastifyReply): Promise<IResponse> {
		const db = req.server.sqlite as Database;
		const service = new UserService(db);
		
		const { id, username, nickname, password } = req.body as { id: string | number, username: string, nickname: string, password: string };
		if ((req as any).user?.id !== id)
			return { status: 403, reply: "Unauthorized" };
		const { status, reply } = await service.updateProfile(username, nickname, password);
		return { status, reply };
	}

	async profile(req: FastifyRequest, _res: FastifyReply): Promise<IResponse> {
		const db = req.server.sqlite as Database;
		const service = new UserService(db);

		const { id }  = req.params as { id: number | string };
		const userId: number = id === 'me' ? (req as any).user?.id : Number(id);
		const { status, reply } = await service.profile(userId);
		return { status, reply };
	}

	async all(req: FastifyRequest, _res: FastifyReply): Promise<IResponse> {
		const db = req.server.sqlite as Database;
		const service = new UserService(db);
	
		const { status, reply } = await service.all();
		return { status, reply };
	}

	async uploadProfilePicture(req: FastifyRequest, _res: FastifyReply): Promise<IResponse> {
		const db = req.server.sqlite as Database;
		const service = new UserService(db);
		try {
			const { id } = req.body as { id: string | number };
			const userId = (req as any).user?.id;
			if (!userId || userId !== id) {
				return { status: 403, reply: "Unauthorized" };
			}

			const data = await (req as any).file();
			const uploadDir = path.join(__dirname, '../../../uploads');
			if (!/^\d+$/.test(String(userId)))
				throw new Error("Invalid user ID");
			if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
			const filePath = path.join(uploadDir, `${userId}.jpg`);
			await data.toFile(filePath);
			return { status: 200, reply: "Profile picture uploaded successfully" };
		} catch (error) {
			if (error instanceof Error) {
				return { status: 400, reply: error.message };
			}
			return { status: 500, reply: "Unknown error" };
		}
	}
};

export const userController = new UserController();
