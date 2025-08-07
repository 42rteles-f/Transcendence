import { FastifyReply, FastifyRequest } from 'fastify';
import { Get, Post, Router } from '.';
import { userController } from '../controllers/user';
import {
	verifyPassword,
	verifyUsername,
} from '../middlewares/user';

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

	@Post(undefined, false, [verifyUsername, verifyPassword])
	async register(req: FastifyRequest, res: FastifyReply) {
		const { status, reply } = await userController.register(req, res);
		res.status(status).send({ message: reply });
	}

	@Post("update", true, [])
	async updateProfile(req: FastifyRequest, res: FastifyReply) {
		const { status, reply } = await userController.updateProfile(req, res);
		res.status(status).send({ message: reply });
	}

	@Get("all", true, [])
	async all(req: FastifyRequest, res: FastifyReply) {
		const { status, reply } = await userController.all(req, res);
		res.status(status).send({ message: reply });
	}

	@Get("match-history/:id", true, [])
	async matchHistory(req: FastifyRequest, res: FastifyReply) {
		const { status, reply } = await userController.matchHistory(req, res);
		res.status(status).send({ message: reply });
	}

	@Post("friend-request/:id", true, [])
	async friendRequest(req: FastifyRequest, res: FastifyReply) {
		const { status, reply } = await userController.friendRequest(req, res);
		res.status(status).send({ message: reply });
	}

	@Get("friend-request/:id", true, [])
	async getFriendRequest(req: FastifyRequest, res: FastifyReply) {
		const { status, reply } = await userController.getFriendRequest(req, res);
		res.status(status).send({ message: reply });
	}

	@Get("all-friend-requests/:id", true, [])
	async getAllFriendRequests(req: FastifyRequest, res: FastifyReply) {
		const { status, reply } = await userController.getAllFriendRequests(req, res);
		res.status(status).send({ message: reply });
	}

	@Get("friends-list/:id", true, [])
	async getAllFriends(req: FastifyRequest, res: FastifyReply) {
		const { status, reply } = await userController.getAllFriends(req, res);
		res.status(status).send({ message: reply });
	}

	@Get("not-friends-list/:id", true, [])
	async findUsers(req: FastifyRequest, res: FastifyReply) {
		const { status, reply } = await userController.findUsers(req, res);
		res.status(status).send({ message: reply });
	}
};

export {}
