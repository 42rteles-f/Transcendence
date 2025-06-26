import { FastifyInstance } from 'fastify';
import { OAuth2Client } from 'google-auth-library';
import jtw from 'jsonwebtoken';
import UserDatabase from '../database/user';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export default async function googleAuthRoutes(server: FastifyInstance) {
	server.post('/auth/google', async (req, reply) => {
		const { credential } = req.body as { credential: string };
		try {
			const ticket = await client.verifyIdToken({
				idToken: credential,
				audience: process.env.GOOGLE_CLIENT_ID
			});
			const payload = ticket.getPayload();
			if (!payload || !payload.email)
				throw new Error("Invalid Google token");

			const db = server.sqlite as any;
			const userDb = new UserDatabase(db);
			let user = await userDb.getByEmail(payload.email);
			if (!user)
				user = await userDb.createGoogleUser(payload.email, payload.name || "", 'google-sign-in.png');

			const token = jtw.sign(
				{ id: user.id, username: user.username, email: user.email },
				process.env.JWT_SECRET!,
				{ expiresIn: "1h" }
			);

			reply.status(200).send({ token });
		} catch (error) {
			reply.status(400).send({
				message: error instanceof Error ? error.message : "Google authentication failed"
			});
		}
	});
}