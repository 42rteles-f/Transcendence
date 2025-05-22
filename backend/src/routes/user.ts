import { FastifyReply, FastifyRequest } from 'fastify';
import { Get, Post, Router } from '.';
import { userController } from '../controllers/user';
import { verifyCredentials } from '../middlewares/user';

@Router()
class UserRoutes {
	
	@Get(undefined, true, [])
	async profile(req: FastifyRequest, res: FastifyReply) {
		res.status(200).send({ message: "getting from profile" });
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

};

export {}
