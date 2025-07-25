import { Database } from 'sqlite3';

export default class GameDatabase {
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

    async createGame(player1Id: number, player2Id: number): Promise<{ status: number, reply: any }> {
        try {
            await this.runAsync(
                `INSERT INTO games (player1_id, player2_id, status) VALUES (?, ?, ?)`,
                [player1Id, player2Id, 'waiting']
            );
            const game = await this.getAsync(
                `SELECT * FROM games WHERE id = (SELECT last_insert_rowid() AS id)`, []
            );
            return { status: 200, reply: game };
        } catch (error) {
            if (error instanceof Error)
                return { status: 400, reply: error.message };
            return { status: 500, reply: "Unknown error" };
        }
    }
}