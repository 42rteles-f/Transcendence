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
};

export const userController = new UserController();
