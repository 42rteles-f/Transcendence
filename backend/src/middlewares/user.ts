import { FastifyReply, FastifyRequest } from 'fastify'

const USERNAME_REGEX = /^(?=.*[A-Za-z])[A-Za-z_]{2,12}$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,64}$/;

export const verifyCredentials = async (req: FastifyRequest, res: FastifyReply): Promise<void> => {
	const { username, nickname, password } = req?.body as { username: string, nickname: string, password: string };

	if (!username || !password || !nickname) {
		res.status(400).send({
			message: "missing username or nickname or password"
		});
	}
	if (!username.match(USERNAME_REGEX)) {
		res.status(400).send({
			message: "username must be 2–12 characters long, use only letters and underscores, and contain at least one letter"
		});
	}
	if (!nickname.match(USERNAME_REGEX)) {
		res.status(400).send({
			message: "nickname must be 2–12 characters long, use only letters and underscores, and contain at least one letter"
		});
	}
	if (!password.match(PASSWORD_REGEX)) {
		res.status(400).send({
			message: "password must be 8-64 characters long, use at least one lowercase letter, one uppercase letter, a digit, and a special character"
		});
	}
}


export const verifyUsername = async (req: FastifyRequest, res: FastifyReply): Promise<void> => {
	const { username } = req?.body as { username: string };

	if (!username) {
		res.status(400).send({
			message: "missing username"
		});
		return;
	}
	if (!username.match(USERNAME_REGEX)) {
		res.status(400).send({
			message: "username must be 2–12 characters long, use only letters and underscores, and contain at least one letter"
		});
		return;
	}
}

export const verifyNickname = async (req: FastifyRequest, res: FastifyReply): Promise<void> => {
	const { nickname } = req?.body as { nickname: string };

	if (!nickname) {
		res.status(400).send({
			message: "missing nickname"
		});
		return;
	}
	if (!nickname.match(USERNAME_REGEX)) {
		res.status(400).send({
			message: "nickname must be 2–12 characters long, use only letters and underscores, and contain at least one letter"
		});
		return;
	}
}

export const verifyPassword = async (req: FastifyRequest, res: FastifyReply): Promise<void> => {
	const { password } = req?.body as { password: string };

	if (!password) {
		res.status(400).send({
			message: "missing password"
		});
		return;
	}
	if (!password.match(PASSWORD_REGEX)) {
		res.status(400).send({
			message: "password must be 8-64 characters long, use at least one lowercase letter, one uppercase letter, a digit, and a special character"
		});
		return;
	}
}
