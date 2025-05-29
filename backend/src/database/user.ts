import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { server } from '../index';
import IResponse from '../interfaces/user';
import type { Knex } from 'knex';
export default class UserDatabase {
	constructor() {
	}

	async register(username: string, nickname: string, password: string): Promise<IResponse> {
		const client = server.knex;
		if (!client)
			return { status: 500, reply: "Database connection not initialized" };
		const hashedPassword = await bcrypt.hash(password, 10);
		try {
			const [user] = await client('users')
				.insert({ username, nickname, password: hashedPassword })
				.returning(['id', 'username']);
			if (!user)
				throw new Error("User creation failed");
			const token = jwt.sign(
				{ id: user.id, username: user.username },
				process.env.JWT_SECRET!,
				{ expiresIn: Number(process.env.JWT_EXPIRATION) }
			);
			return { status: 200, reply: token };
		} catch (error) {
			if (error instanceof Error)
				return { status: 400, reply: error.message };
			return { status: 500, reply: "Unknown error" };
		}
	}

	async login(username: string, password: string): Promise<IResponse> {
		const client = server.knex;
		if (!client)
			return { status: 500, reply: "Database connection not initialized" };

		try {
			const user = await client('users')
				.where({ username }).first();
			if (!user)
				throw new Error("Invalid credentials");
			const match = await bcrypt.compare(password, user.password);
			if (!match)
				throw new Error("Invalid credentials");
			const token = jwt.sign(
				{ id: user.id, username: user.username },
				process.env.JWT_SECRET!,
				{ expiresIn: Number(process.env.JWT_EXPIRATION) }
			);
			return { status: 200, reply: token };
		} catch (error) {
			if (error instanceof Error)
				return { status: 400, reply: error.message };
			return { status: 500, reply: "Unknown error" };
		}
	}

	async updateProfile(username: string,
						nickname: string,
						password: string): Promise<IResponse> {
		const client = server.knex;
		if (!client)
			return { status: 500, reply: "Database connection not initialized" };

		const hashedPassword = await bcrypt.hash(password, 10);
		try {
			const updated = await client('users')
				.where({ username })
				.update({ nickname, password: hashedPassword });
			if (!updated)
				throw new Error("User update failed");
			return { status: 200, reply: "User updated successfully" };
		} catch (error) {
			if (error instanceof Error)
				return { status: 400, reply: error.message };
			return { status: 500, reply: "Unknown error" };
		}
	}
}