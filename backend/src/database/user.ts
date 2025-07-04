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

    async register(username: string, nickname: string, password: string): Promise<IResponse> {
        const hashedPassword = await bcrypt.hash(password, 10);

        try {
            const existing = await this.getAsync('SELECT id FROM users WHERE username = ?', [username]);
            if (existing)
                return { status: 400, reply: "Username already exists" };

            await this.runAsync(
                'INSERT INTO users (username, nickname, password) VALUES (?, ?, ?)',
                [username, nickname, hashedPassword]
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
                // { expiresIn: Number(process.env.JWT_EXPIRATION) }
                { expiresIn: "1h" }
            );
            return { status: 200, reply: token };
        } catch (error) {
            if (error instanceof Error)
                return { status: 400, reply: error.message };
            return { status: 500, reply: "Unknown error" };
        }
    }

    async updateProfile(userId: number, username: string | undefined, nickname: string | undefined, fileName: string | undefined): Promise<IResponse> {
        try {
            const result = await this.runAsync(
                'UPDATE users SET username = ?, nickname = ?, profile_picture = ? WHERE id = ?',
                [username, nickname, fileName, userId]
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
            const user = await this.getAsync(`SELECT u.username,
													 u.nickname,
													 COUNT(g.id) AS gamesPlayed,
													 SUM(CASE WHEN ((g.player1 = u.id AND g.player1_score > g.player2_score) OR (g.player2 = u.id AND g.player1_score < g.player2_score) AND g.status = 'finished') THEN 1 ELSE 0 END) AS gamesWon,
													 SUM(CASE WHEN ((g.player1 = u.id AND g.player1_score < g.player2_score) OR (g.player2 = u.id AND g.player1_score > g.player2_score) AND g.status = 'finished') THEN 1 ELSE 0 END) AS gamesLost,
													 u.profile_picture as profilePicture
												FROM users AS u
												LEFT JOIN games AS g ON u.id = g.player1 OR u.id = g.player2
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

    async all(): Promise<IResponse> {
        try {
            const users = await this.allAsync(`SELECT u.username, 
													  u.nickname,
													  COUNT(g.id) AS gamesPlayed
												 FROM users u
												 LEFT JOIN games g ON u.id = g.player1 OR u.id = g.player2
												GROUP BY u.id
												ORDER BY gamesPlayed DESC`);
            return { status: 200, reply: users };
        } catch (error) {
            if (error instanceof Error)
                return { status: 400, reply: error.message };
            return { status: 500, reply: "Unknown error" };
        }
    }
}