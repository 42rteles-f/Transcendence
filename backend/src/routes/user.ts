import { FastifyReply, FastifyRequest } from 'fastify';
import { Get, Post, Router } from '.';
import { userController } from '../controllers/user';
import { verifyCredentials } from '../middlewares/user';

@Router()
class UserRoutes {
	
	@Get('profile/:id', true, [])
	async profile(req: FastifyRequest, res: FastifyReply) {
		const { status, reply } = await userController.profile(req, res);
		res.status(status).send({ message: reply });
	}

	@Post(undefined, false, [])
	async login(req: FastifyRequest, res: FastifyReply) {
		const { status, reply } = await userController.login(req, res);
		res.status(status).send({ message: reply });
	}

	@Post(undefined, false, [verifyCredentials])
	async register(req: FastifyRequest, res: FastifyReply) {
		const { status, reply } = await userController.register(req, res);
		res.status(status).send({ message: reply });
	}

	@Post("update", true, [verifyCredentials])
	async updateProfile(req: FastifyRequest, res: FastifyReply) {
		const { status, reply } = await userController.updateProfile(req, res);
		res.status(status).send({ message: reply });
	}

	@Get("all", true, [])
	async all(req: FastifyRequest, res: FastifyReply) {
		const { status, reply } = await userController.all(req, res);
		res.status(status).send({ message: reply });
	}

};

export {}
