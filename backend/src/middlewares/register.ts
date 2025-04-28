import { FastifyError, FastifyReply, FastifyRequest } from 'fastify'

const USERNAME_REGEX = /^(?=.*[A-Za-z])[A-Za-z_]{2,12}$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,64}$/;

export const verifyUsername = async (
										req: FastifyRequest<{ Body: { username: string }}>,
										res: FastifyReply
									): Promise<void> => {
	const { username } = req?.body;
	if (!username || !username.match(USERNAME_REGEX)) {
		res.status(400).send({
			message: "username must be 2–12 characters long, use only letters and underscores, and contain at least one letter"
		});
	}
}

export const verifyPassword = async (
										req: FastifyRequest<{ Body: { password: string }}>,
										res: FastifyReply
									): Promise<void> => {
	const { password } = req?.body;
	if (!password || !password.match(PASSWORD_REGEX)) {
		res.status(400).send({
			message: "password must be 8-64 characters long, use at least one lowercase letter, one uppercase letter, a digit, and a special character"
		});
	}
}
