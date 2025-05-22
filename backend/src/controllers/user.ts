import { FastifyReply, FastifyRequest } from 'fastify';
import IResponse from '../interfaces/user';
import UserService from '../services/user';

class UserController {
	private userService: UserService;

	constructor () {
		this.userService = new UserService();
	}

	async register(req: FastifyRequest, _res: FastifyReply): Promise<IResponse> {
		const { username, nickname, password } = req.body as { username: string, nickname: string, password: string };
		const { status, reply } = await this.userService.register(username, nickname, password);
		return { status, reply };
	}

	async login(req: FastifyRequest, _res: FastifyReply): Promise<IResponse> {
		const { username, password } = req.body as { username: string, password: string };
		const { status, reply } = await this.userService.login(username, password);
		return { status, reply };
	}

	async updateProfile(req: FastifyRequest, _res: FastifyReply): Promise<IResponse> {
		const { username, nickname, password } = req.body as { username: string, nickname: string, password: string };
		if ((req as any).user?.username !== username)
			return { status: 403, reply: "Unauthorized" };
		const { status, reply } = await this.userService.updateProfile(username, nickname, password);
		return { status, reply };
	}
};

export const userController = new UserController();
