import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import IResponse from '../interfaces/user';
import { Database } from 'sqlite3';

export default class UserDatabase {
    db: Database;

    constructor(db: Database) {
        this.db = db;
    }

    private async runAsync(sql: string, params: any[] = []): Promise<{ changes: number }> {
        return await new Promise((resolve, reject) => {
            this.db.run(sql, params, function (err) {
                if (err) reject(err);
                else resolve({ changes: this.changes });
            });
        });
    }

    private async getAsync(sql: string, params: any[] = []): Promise<any> {
        return await new Promise((resolve, reject) => {
            this.db.get(sql, params, function (err, row) {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    private async allAsync(sql: string, params: any[] = []): Promise<any[]> {
        return await new Promise((resolve, reject) => {
            this.db.all(sql, params, function (err, rows) {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    async register(username: string, password: string): Promise<IResponse> {
        const hashedPassword = await bcrypt.hash(password, 10);

        try {
            const existing = await this.getAsync('SELECT id FROM users WHERE username = ?', [username]);
            if (existing)
                return { status: 400, reply: "Username already exists" };

            await this.runAsync(
                'INSERT INTO users (username, password) VALUES (?, ?)',
                [username, hashedPassword]
            );

            const user = await this.getAsync('SELECT id, username FROM users WHERE username = ?', [username]);
            if (!user)
                throw new Error("User creation failed");
            const token = jwt.sign(
                { id: user.id, username: user.username },
                process.env.JWT_SECRET!,
                { expiresIn: "1h" /* Number(process.env.JWT_EXPIRATION) */ }
            );
            return { status: 200, reply: token };
        } catch (error) {
            if (error instanceof Error)
                return { status: 400, reply: error.message };
            return { status: 500, reply: "Unknown error" };
        }
    }

    async login(username: string, password: string): Promise<IResponse> {
        try {
			console.log("Login attempt for user:", username);
            const user = await this.getAsync('SELECT * FROM users WHERE username = ?', [username]);
            if (!user)
                throw new Error("Invalid credentials");
			console.log("found user:", username);

            const match = await bcrypt.compare(password, user.password);
            if (!match)
                throw new Error("Invalid credentials");
			console.log(`secret: ${process.env.JWT_SECRET}`);

            const token = jwt.sign(
                { id: user.id, username: user.username },
                process.env.JWT_SECRET!,
                { expiresIn: "1h" }
            );
            return { status: 200, reply: token };
        } catch (error) {
            if (error instanceof Error)
                return { status: 400, reply: error.message };
            return { status: 500, reply: "Unknown error" };
        }
    }

    async updateProfile(userId: number, username: string | undefined, fileName: string | undefined): Promise<IResponse> {
        try {
			const existingUser = await this.getAsync('SELECT id FROM users WHERE username = ?', [username]);
			if (existingUser && existingUser.id !== userId)
				throw new Error("Username already exists");
            const result = await this.runAsync(
                'UPDATE users SET username = ?, profile_picture = ? WHERE id = ?',
                [username, fileName, userId]
            );
            if (result.changes === 0)
                throw new Error("User update failed");
            return { status: 200, reply: "User updated successfully" };
        } catch (error) {
            if (error instanceof Error)
                return { status: 400, reply: error.message };
            return { status: 500, reply: "Unknown error" };
        }
    }

    async profile(id: number): Promise<IResponse> {
        try {
            const user = await this.getAsync(`SELECT u.id,
													 u.username,
													 COUNT(g.id) AS gamesPlayed,
													 SUM(CASE WHEN ((u.id IN (g.player1_id, g.player2_id) AND g.winner_id = u.id) AND g.status = 'finished') THEN 1 ELSE 0 END) AS gamesWon,
													 SUM(CASE WHEN ((u.id IN (g.player1_id, g.player2_id) AND g.winner_id != u.id) AND g.status = 'finished') THEN 1 ELSE 0 END) AS gamesLost,
													 u.profile_picture as profilePicture
												FROM users AS u
												LEFT JOIN games AS g ON (u.id = g.player1_id OR u.id = g.player2_id) AND g.status = 'finished'
												WHERE u.id = ?
												GROUP BY u.id
												`, [id]);
            if (!user)
                throw new Error("User not found");
            return { status: 200, reply: user };
        } catch (error) {
            if (error instanceof Error)
                return { status: 400, reply: error.message };
            return { status: 500, reply: "Unknown error" };
        }
    }

	async matchHistory(id: number, page: number = 1, pageSize: number = 10): Promise<IResponse> {
		try {
			const offset = (page - 1) * pageSize;
			const games = await this.allAsync(`SELECT g.id, 
													  g.player1_id AS player1Id,
													  g.player2_id AS player2Id,
													  g.winner_id AS winnerId,
													  u1.username AS player1_name,
													  u2.username AS player2_name,
													  g.player1_score,
													  g.player2_score,
													  g.status,
													  g.created_at
											 FROM games g
											 LEFT JOIN users u1 ON g.player1_id = u1.id
											 LEFT JOIN users u2 ON g.player2_id = u2.id
											 WHERE (g.player1_id = ? OR g.player2_id = ?) AND g.status = 'finished'
											 ORDER BY g.created_at DESC
											 LIMIT ? OFFSET ?`, [id, id, pageSize, offset]);
			if (!games || games.length === 0)
				return { status: 404, reply: "No games found" };
			const total = await this.getAsync(`SELECT COUNT(*) as count
											 FROM games g
											 WHERE g.player1_id = ? OR g.player2_id = ?`, [id, id]);
			return { status: 200, reply: { games, total: total.count } };
		} catch (error) {
			if (error instanceof Error)
				return { status: 400, reply: error.message };
			return { status: 500, reply: "Unknown error" };
		}
	}

    async all(): Promise<IResponse> {
        try {
            const users = await this.allAsync(`SELECT u.username, 
													  COUNT(g.id) AS gamesPlayed
												 FROM users u
												 LEFT JOIN games g ON u.id = g.player1_id OR u.id = g.player2_id
												 WHERE g.status = 'finished'
												GROUP BY u.id
												ORDER BY gamesPlayed DESC`);
            return { status: 200, reply: users };
        } catch (error) {
            if (error instanceof Error)
                return { status: 400, reply: error.message };
            return { status: 500, reply: "Unknown error" };
        }
    }

	async getByEmail(email: string): Promise<any | null> {
		try {
			const user = await this.getAsync('SELECT * FROM users WHERE email = ?', [email]);
			return user || null;
		} catch (error) {
			return null;
		}
	}

	async createGoogleUser(email: string, name: string, picture: string): Promise<any> {
		const baseUsername = name ? name.replace(/\s+/g, '').toLowerCase() : email.split('@')[0];
		let username = baseUsername;
		let suffix = 1;
		while (await this.getAsync('SELECT id FROM users WHERE username = ?', [username]))
			username = `${baseUsername}${suffix++}`;

		await this.runAsync(
			'INSERT INTO users (username, email, profile_picture) VALUES (?, ?, ?)',
			[username, email, picture]
		);
		return await this.getByEmail(email);
	}

	async friendRequest(
		userId: number,
		friendId: number,
		status: 'pending' | 'accepted' | 'rejected' | 'removed' | 'no friendship' | 'blocked'
	): Promise<IResponse> {
		try {
			const [userA, userB] = [userId, friendId].sort((a, b) => a - b);

			let request = await this.getAsync(
				'SELECT * FROM friend_requests WHERE user_id = ? AND friend_id = ?',
				[userA, userB]
			);

			if (status === "blocked") {
				if (!request) {
					await this.runAsync(
						'INSERT INTO friend_requests (user_id, friend_id, status, requester_id) VALUES (?, ?, ?, ?)',
						[userA, userB, status, userId]
					);
					return { status: 200, reply: "User blocked." };
				} else {
					if (request.status === "blocked")
						return { status: 400, reply: "User is already blocked." };
					await this.runAsync(
						'UPDATE friend_requests SET status = ?, requester_id = ? WHERE user_id = ? AND friend_id = ?',
						[status, userId, userA, userB]
					);
					return { status: 200, reply: "User blocked." };
				}
			}

			if (!request) {
				if (status !== "pending")
					return { status: 403, reply: "You can only send a friend request." };
				await this.runAsync(
					'INSERT INTO friend_requests (user_id, friend_id, status, requester_id) VALUES (?, ?, ?, ?)',
					[userA, userB, status, userId]
				);
				return { status: 200, reply: "Friend request sent." };
			}

			if (request.status === "pending") {
				if (status === "removed") {
					if (request.requester_id !== userId)
						return { status: 403, reply: "Only the requester can cancel the request." };
					await this.runAsync(
						'UPDATE friend_requests SET status = ? WHERE user_id = ? AND friend_id = ?',
						[status, userA, userB]
					);
					return { status: 200, reply: "Friend request cancelled." };
				}
				if (status === "accepted" || status === "rejected") {
					if (request.requester_id === userId)
						return { status: 403, reply: "Only the recipient can accept or reject the request." };
					await this.runAsync(
						'UPDATE friend_requests SET status = ? WHERE user_id = ? AND friend_id = ?',
						[status, userA, userB]
					);
					return { status: 200, reply: `Friend request ${status}.` };
				}
				return { status: 400, reply: "Invalid operation for pending request." };
			}

			if (request.status === "accepted") {
				if (status === "removed") {
					await this.runAsync(
						'UPDATE friend_requests SET status = ? WHERE user_id = ? AND friend_id = ?',
						[status, userA, userB]
					);
					return { status: 200, reply: "Friendship removed." };
				}
				return { status: 400, reply: "Invalid operation for accepted friendship." };
			}

			if (status === "pending") {
				await this.runAsync(
					'UPDATE friend_requests SET status = ?, requester_id = ? WHERE user_id = ? AND friend_id = ?',
					[status, userId, userA, userB]
				);
				return { status: 200, reply: "Friend request sent again." };
			}

			return { status: 400, reply: "Invalid operation." };
		} catch (error) {
			if (error instanceof Error)
				return { status: 400, reply: error.message };
			return { status: 500, reply: "Unknown error" };
		}
	}

	async getAllFriendRequests(userId: number): Promise<IResponse> {
		try {
			const requests = await this.getAsync('SELECT * FROM friend_requests WHERE (user_id = ? OR friend_id = ?) AND status != "blocked"', [userId, userId]);
			if (!requests)
				return { status: 200, reply: "no friendship" };
			return { status: 200, reply: requests };
		} catch (error) {
			if (error instanceof Error)
				return { status: 400, reply: error.message };
			return { status: 500, reply: "Unknown error" };
		}
	}

	async findUsers(userId: number): Promise<IResponse> {
		try {
			const notFriends = await this.allAsync(`
				SELECT
					u.id,
					fr.requester_id,
					u.username,
					u.profile_picture,
					fr.status as friendship_status
				FROM users u
				LEFT JOIN friend_requests fr
					ON (
						(fr.user_id = u.id AND fr.friend_id = ?)
						OR (fr.friend_id = u.id AND fr.user_id = ?)
					)
				WHERE u.id != ?
				AND (fr.status IS NULL OR (fr.status != 'accepted' AND fr.status != 'blocked'))
			`, [userId, userId, userId]);
			return { status: 200, reply: notFriends };
		} catch (error) {
			if (error instanceof Error)
				return { status: 400, reply: error.message };
			return { status: 500, reply: "Unknown error" };
		}
	}

	async getFriendRequest(userId: number | string, friendId: number | string): Promise<IResponse> {
		try {
			const request = await this.getAsync(`
				SELECT *
				FROM friend_requests
				WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)
			`, [userId, friendId, friendId, userId]);
			if (!request)
				return { status: 200, reply: "Friend request not found" };
			return { status: 200, reply: request };
		} catch (error) {
			if (error instanceof Error)
				return { status: 400, reply: error.message };
			return { status: 500, reply: "Unknown error" };
		}
	}


	async getAllFriends(userId: number): Promise<IResponse> {
		try {
			const friends = await this.allAsync(`
				SELECT 
					u.id, 
					fr.requester_id,
					u.username,
					u.profile_picture,
					fr.status as friendship_status
				FROM users u
				INNER JOIN friend_requests fr
					ON (
						(fr.user_id = u.id AND fr.friend_id = ?)
						OR (fr.friend_id = u.id AND fr.user_id = ?)
					)
					AND fr.status = 'accepted'
				WHERE u.id != ?
			`, [userId, userId, userId]);
			return { status: 200, reply: friends };
		} catch (error) {
			if (error instanceof Error)
				return { status: 400, reply: error.message };
			return { status: 500, reply: "Unknown error" };
		}
	}

	async registerMessage(senderId: number, receiverId: number, message: string) {
		try {
			await this.runAsync(`INSERT INTO chat (
													sender_id,
													receiver_id,
													message)
											VALUES (
													?,
													?,
													?
												)`, [senderId, receiverId, message]);
			return ({ status: 200, reply: "ok" });
		} catch (error) {
			if (error instanceof Error)
				return { status: 400, reply: error.message };
			return { status: 500, reply: "Unknown error" };
		}
	}

	async getMessages(senderId: number, receiverId: number) {
		try {
			const messages = await this.allAsync(`SELECT
													sender_id AS senderId,
													receiver_id AS receiverId,
													message,
													created_at AS sentAt
													FROM chat
				WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
				ORDER BY sentAt ASC`,
			[senderId, receiverId, receiverId, senderId]);
			return ({ status: 200, reply: messages });
		} catch (error) {
			if (error instanceof Error)
				return { status: 400, reply: error.message };
			return { status: 500, reply: "Unknown error" };
		}

	}
}