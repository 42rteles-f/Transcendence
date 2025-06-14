import { FastifyReply, FastifyRequest } from 'fastify';
import IResponse from '../interfaces/user';
import UserService from '../services/user';
import { Database } from 'sqlite3';

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
		
		const { username, nickname, password } = req.body as { username: string, nickname: string, password: string };
		if ((req as any).user?.username !== username)
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
};

export const userController = new UserController();
