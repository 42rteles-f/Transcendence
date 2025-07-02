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
		console.log(`body arriving in updateProfile: ${JSON.stringify(req.body)}`);
		try {
			let userId: number;
			let username: string | undefined;
			let nickname: string | undefined;
			let fileName: string | undefined;

			userId = (req as any).user?.id;
					
			if (!userId || !/^\d+$/.test(String(userId))) {
				throw new Error("Invalid user ID");
			}

			fileName = `${userId}.png`;

			const parts = (req as any).parts();
			for await (const part of parts) {
				const obj = {
					type: part.type,
					fieldname: part.fieldname,
					filename: part.filename,
					value: part.value,
					file: part.file
				};
				console.log(`part: ${JSON.stringify(obj)}`);
				if (part.type === 'file' && part.fieldname === 'profilePicture') {
					if (!part.filename || part.file.truncated || part.file.bytesRead === 0)
						continue ;
					else {
						const uploadDir = path.resolve(process.cwd(), 'uploads');
						if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
						const filePath = path.join(uploadDir, fileName);
						const writeStream = fs.createWriteStream(filePath);
	
						await new Promise<void>((resolve, reject) => {
							part.file.pipe(writeStream);
							part.file.on('end', () => {
								writeStream.end();
							});
							writeStream.on('finish', () => {
								console.log(`image uploaded to ${filePath}`);
								resolve();
							});
							writeStream.on('error', (err) => {
								console.error(`Error writing file: ${err.message}`);
								reject(err);
							});
						});
					}
				} else if (part.type === 'field' && part.fieldname === 'nickname')
					nickname = part.value;
				else if (part.type === 'field' && part.fieldname === 'username')
					username = part.value;
			}

			if (!username || !nickname) {
				throw new Error("Username and nickname are required");
			}

			const db = req.server.sqlite as Database;
			const service = new UserService(db);

			const {status, reply } = await service.updateProfile(userId, username, nickname, fileName);
			return { status, reply };
			
		} catch (error) {
			if (error instanceof Error) {
				return { status: 400, reply: error.message };
			}
			return { status: 500, reply: "Unknown error" };
		}
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

	async matchHistory(req: FastifyRequest, _res: FastifyReply): Promise<IResponse> {
		const db = req.server.sqlite as Database;
		const service = new UserService(db);

		const { id } = req.params as { id: number | string };
		const { page, pageSize } = req.query as { page?: string, pageSize?: string };
		const userId: number = id === 'me' ? (req as any).user?.id : Number(id);
		if (!userId || !/^\d+$/.test(String(userId)))
			return { status: 400, reply: "Invalid user ID" };

		const pageNum = page ? parseInt(page) : 1;
		const pageSizeNum = pageSize ? parseInt(pageSize) : 10;
		const { status, reply } = await service.matchHistory(userId, pageNum, pageSizeNum);
		return { status, reply };
	}

	async friendRequest(req: FastifyRequest, _res: FastifyReply): Promise<IResponse> {
		const db = req.server.sqlite as Database;
		const service = new UserService(db);

		const userId: number = (req as any).user?.id;
		if (!userId || !/^\d+$/.test(String(userId)))
			return { status: 400, reply: "Invalid user ID" };

		const { id } = req.params as { id: number | string };
		let friendId: number | string = id;
		if (!friendId || !/^\d+$/.test(String(friendId)))
			return { status: 400, reply: "Invalid friend ID" };
	
		const { status } = req.body as { status: 'pending' | 'accepted' | 'rejected' | 'removed' | 'no friendship' };
		if (!['pending', 'accepted', 'rejected', 'removed', 'no friendship'].includes(status))
			return { status: 400, reply: "Invalid status" };

		friendId = Number(friendId);
		const response = await service.friendRequest(userId, friendId, status);
		return response;
	}

	async getAllFriendRequests(req: FastifyRequest, _res: FastifyReply): Promise<IResponse> {
		const db = req.server.sqlite as Database;
		const service = new UserService(db);

		const { id } = req.params as { id: number | string };
		
		if (!id || !/^\d+$/.test(String(id)))
			return { status: 400, reply: "Invalid friend ID" };

		const userId: number = Number(id);
		const { status, reply } = await service.getAllFriendRequests(userId);
		return { status, reply };
	}

	async findUsers(req: FastifyRequest, _res: FastifyReply): Promise<IResponse> {
		const db = req.server.sqlite as Database;
		const service = new UserService(db);

		const { id } = req.params as { id: number | string };
		const userId: number = id === 'me' ? Number((req as any).user?.id) : Number(id);
		if (!userId || !/^\d+$/.test(String(userId)))
			return { status: 400, reply: "Invalid user ID" };

		const { status, reply } = await service.findUsers(userId);
		return { status, reply };
	}

	async getFriendRequest(req: FastifyRequest, _res: FastifyReply): Promise<IResponse> {
		const db = req.server.sqlite as Database;
		const service = new UserService(db);

		const userId: number = (req as any).user?.id;
		if (!userId || !/^\d+$/.test(String(userId)))
			return { status: 400, reply: "Invalid user ID" };
	
		const { id } = req.params as { id: number | string };
		let friendId: number | string = id;
		if (!friendId || !/^\d+$/.test(String(friendId)))
			return { status: 400, reply: "Invalid friend ID" };
		
		friendId = Number(friendId);
		if (userId === friendId)
			return { status: 400, reply: "Cannot get friend request with self" };
	
		const { status, reply } = await service.getFriendRequest(userId, friendId);
		return { status, reply };
	}

	async getAllFriends(req: FastifyRequest, _res: FastifyReply): Promise<IResponse> {
		const db = req.server.sqlite as Database;
		const service = new UserService(db);

		const { id } = req.params as { id: number | string };
		const userId: number = id === 'me' ? Number((req as any).user?.id) : Number(id);
		if (!userId || !/^\d+$/.test(String(userId)))
			return { status: 400, reply: "Invalid user ID" };

		const { status, reply } = await service.getAllFriends(userId);
		return { status, reply };
	}
};

export const userController = new UserController();
