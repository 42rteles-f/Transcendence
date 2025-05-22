import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { server } from '../index';
import IResponse from '../interfaces/user';

export default class UserDatabase {
	constructor() {
	}

	async register(username: string, nickname: string, password: string): Promise<IResponse> {
		const client = server.pg;

		if (!client)
			return { status: 500, reply: "Database connection not initialized" };
		const hashedPassword = await bcrypt.hash(password, 10);
		const query = `INSERT INTO users (username, nickname, password) VALUES ($1, $2, $3) RETURNING *`;
		const values = [username, nickname, hashedPassword];
		try {
			const result = await client.query(query, values);
			if (result?.rowCount === 0)
				throw new Error("User creation failed");
			const user = result.rows[0];
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
		const client = server.pg;

		if (!client)
			return { status: 500, reply: "Database connection not initialized" };
		const query = `SELECT * FROM users WHERE username = $1`;
		const values = [username];
		try {
			const result = await client.query(query, values);
			if (result?.rowCount === 0)
				throw new Error("Invalid credentials");
			const user = result.rows[0];
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
		const client = server.pg;

		if (!client)
			return { status: 500, reply: "Database connection not initialized" };

		const hashedPassword = await bcrypt.hash(password, 10);
		const query = `UPDATE users SET nickname = $1, password = $2 WHERE username = $3 RETURNING *`;
		const values = [nickname, hashedPassword, username];
		try {
			const result = await client.query(query, values);
			if (result?.rowCount === 0)
				throw new Error("User update failed");
			return { status: 200, reply: "User updated successfully" };
		} catch (error) {
			if (error instanceof Error)
				return { status: 400, reply: error.message };
			return { status: 500, reply: "Unknown error" };
		}
	}
}