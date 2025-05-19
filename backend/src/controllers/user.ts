import { FastifyReply, FastifyRequest } from 'fastify';
import IResponse from '../interfaces/user';
import UserService from '../services/user';

class UserController {
	private userService: UserService;

	constructor () {
		this.userService = new UserService();
	}

	async register(req: FastifyRequest, _res: FastifyReply): Promise<IResponse> {
		const { username, password } = req.body as { username: string, password: string };
		const { status, reply } = await this.userService.register(username, password);
		return { status, reply };
	}

	async login(req: FastifyRequest, _res: FastifyReply): Promise<IResponse> {
		const { username, password } = req.body as { username: string, password: string };
		const { status, reply } = await this.userService.login(username, password);
		return { status, reply };
	}
};

export const userController = new UserController();
