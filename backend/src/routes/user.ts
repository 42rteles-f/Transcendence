import { FastifyReply, FastifyRequest } from 'fastify';
import { Get, Post, Router } from '.';

@Router()
class UserRoutes {
	@Get()
	profile(req: FastifyRequest, res: FastifyReply) {
		console.log("user/profile")
		res.status(200).send({ message: "getting from login" });
	}

	@Post("update")
	updateProfile(req: FastifyRequest, res: FastifyReply) {
		console.log("user/update")
	}

	@Post()
	login(req: FastifyRequest, res: FastifyReply) {
		
	}

};

export {}
