import { Database } from 'sqlite3';
import IResponse from '../interfaces/tournament';

export default class TournamentDatabase {
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

    async createTournament(name: string, userId: number, displayName: string, maxPlayers?: number): Promise<IResponse> {
        try {
            const res = await this.runAsync(
                `INSERT INTO tournaments (name, start_date, max_players, owner_id) VALUES (?, ?, ?, ?)`,
                [name, new Date().toISOString(), maxPlayers || 16, userId]
            );
			if (res.changes !== 0) {
				const tournamentId = await this.getAsync(`SELECT last_insert_rowid() AS id`);
				await this.runAsync(
					`INSERT INTO tournament_players (tournament_id, player_id, display_name) VALUES (?, ?, ?)`,
					[tournamentId.id, userId, displayName]
				);
			}
            return { status: 200, reply: "Tournament created" };
        } catch (error) {
            if (error instanceof Error)
                return { status: 400, reply: error.message };
            return { status: 400, reply: "Unknown error" };
        }
    }

	async getAllTournaments(pageNum: number, PageSizeNum: number): Promise<IResponse> {
		try {
			const offset = (pageNum - 1) * PageSizeNum;

			const totalRow = await this.getAsync(
				`SELECT COUNT(*) AS total FROM tournaments`
			);
			const total = totalRow.total || 0;
			const tournaments = await this.allAsync(
				`SELECT t.id,
					t.name,
					t.start_date AS startDate,
					t.winner as winnerId,
					t.owner_id AS ownerId,
                    owner.username AS ownerName,
					t.max_players AS maxPlayers,
					t.status,
                    winner.username AS winnerName
				FROM tournaments t
				LEFT JOIN users winner ON t.winner = winner.id
				LEFT JOIN users owner ON t.owner_id = owner.id
				ORDER BY t.id DESC
				LIMIT ? OFFSET ?`,
				[PageSizeNum, offset]
			);
			return { status: 200, reply: { tournaments, total } };
		} catch (error) {
			if (error instanceof Error)
				return { status: 400, reply: error.message };
			return { status: 400, reply: "Unknown error" };
		}
	}

    async joinTournament(tournamentId: number, userId: number, displayName: string): Promise<IResponse> {
        try {
			const subscribedUsers = await this.allAsync(
				`SELECT player_id, display_name FROM tournament_players WHERE tournament_id = ?`, [tournamentId]
			);
			if (subscribedUsers.some(u => u.player_id === userId))
				return { status: 400, reply: "Already subscribed to this tournament" };
			const tournament = await this.getAsync(`SELECT * FROM tournaments WHERE id = ?`, [tournamentId]);
			if (!tournament)
				return { status: 404, reply: "Tournament not found" };
			if (tournament.status !== 'waiting')
				return { status: 400, reply: "Tournament already started or finished" };
			if (tournament.owner_id === userId)
				return { status: 400, reply: "You cannot join your own tournament" };
			if (tournament.max_players && tournament.max_players <= subscribedUsers.length)
				return { status: 400, reply: "Tournament is full" };
			if (subscribedUsers.some(u => u.display_name === displayName))
				return { status: 400, reply: "Display name already taken in this tournament" };
            await this.runAsync(
                `INSERT INTO tournament_players (tournament_id, player_id, display_name) VALUES (?, ?, ?)`,
                [tournamentId, userId, displayName]
            );
            return { status: 200, reply: "Joined tournament" };
        } catch (error) {
            if (error instanceof Error)
                return { status: 400, reply: error.message };
            return { status: 400, reply: "Unknown error" };
        }
    }

	async unsubscribeTournament(tournamentId: number, userId: number): Promise<IResponse> {
		try {
			const tournament = await this.getAsync(`SELECT * FROM tournaments WHERE id = ?`, [tournamentId]);
			if (!tournament)
				return { status: 404, reply: "Tournament not found" };
			if (tournament.status !== 'waiting')
				return { status: 400, reply: "Tournament already started or finished" };
			const subscribedUsers = await this.allAsync(
				`SELECT player_id FROM tournament_players WHERE tournament_id = ?`, [tournamentId]
			);
			if (!subscribedUsers.some(u => u.player_id === userId))
				return { status: 400, reply: "You are not subscribed to this tournament" };
			await this.runAsync(
				`DELETE FROM tournament_players WHERE tournament_id = ? AND player_id = ?`,
				[tournamentId, userId]
			);
			return { status: 200, reply: "Unsubscribed from tournament" };
		} catch (error) {
			if (error instanceof Error)
				return { status: 400, reply: error.message };
			return { status: 400, reply: "Unknown error" };
		}
	}

    async startTournament(tournamentId: number, userId: number): Promise<IResponse> {
        try {
			const tournament = await this.getAsync(`SELECT * FROM tournaments WHERE id = ?`, [tournamentId]);
			if (!tournament)
				return { status: 404, reply: "Tournament not found" };
			if (tournament.status !== 'waiting')
				return { status: 400, reply: "Tournament already started or finished" };
			if (tournament.owner_id !== userId)
				return { status: 403, reply: "Only the tournament owner can start it" };

			const players: { player_id: number }[] = await this.allAsync(
				`SELECT player_id FROM tournament_players WHERE tournament_id = ?`, [tournamentId]
			);

			if (!players || players.length < 2)
				return { status: 400, reply: "Not enough players to start the tournament" };

			const shuffled = players
				.map(p => p.player_id)
				.sort(() => Math.random() - 0.5);

			const games: [number, number | null][] = [];
			for (let i = 0; i < shuffled.length; i += 2) {
				const p1 = shuffled[i];
				const p2 = shuffled[i + 1] ?? null;
				games.push([p1, p2]);
			}

			for (const [p1, p2] of games) {
				if (p2 === null)  {
					const result = await this.runAsync(
						`INSERT INTO games (player1_id, player2_id, status) VALUES (?, ?, ?)`,
						[p1, p2, 'pending']
					);
					const gameId = (await this.getAsync(`SELECT last_insert_rowid() AS id`)).id;
					await this.runAsync(
						`INSERT INTO tournament_games (tournament_id, game_id) VALUES (?, ?)`,
						[tournamentId, gameId]
					);
					continue;
				}
				const result = await this.runAsync(
					`INSERT INTO games (player1_id, player2_id, status) VALUES (?, ?, ?)`,
					[p1, p2, 'pending']
				);

				const gameId = (await this.getAsync(`SELECT last_insert_rowid() AS id`)).id;

				await this.runAsync(
					`INSERT INTO tournament_games (tournament_id, game_id) VALUES (?, ?)`,
					[tournamentId, gameId]
				);
			}
            await this.runAsync(
                `UPDATE tournaments SET status = 'in progress', start_date = ? WHERE id = ?`,
                [new Date().toISOString(), tournamentId]
            );
            return { status: 200, reply: "Tournament started" };
        } catch (error) {
            if (error instanceof Error)
                return { status: 400, reply: error.message };
            return { status: 400, reply: "Unknown error" };
        }
    }


	async createNextRoundGames(tournamentId: number): Promise<IResponse> {
		try {
			const winners: { winner_id: number }[] = await this.allAsync(
				`SELECT g.winner_id
				FROM tournament_games tg
				JOIN games g ON tg.game_id = g.id
				WHERE tg.tournament_id = ? AND g.winner_id IS NOT NULL`,
				[tournamentId]
			);

			const byes: { player1_id: number }[] = await this.allAsync(
				`SELECT g.player1_id
				FROM tournament_games tg
				JOIN games g ON tg.game_id = g.id
				WHERE tg.tournament_id = ? AND g.player2_id IS NULL AND (g.status = 'bye' OR g.status = 'pending')`,
				[tournamentId]
			);

			const qualified = [
				...winners.map(w => w.winner_id),
				...byes.map(b => b.player1_id)
			];

			if (qualified.length < 2)
				return { status: 400, reply: "Not enough players for next round" };

			const shuffled = qualified.sort(() => Math.random() - 0.5);
			const games: [number, number | null][] = [];
			for (let i = 0; i < shuffled.length; i += 2) {
				const p1 = shuffled[i];
				const p2 = shuffled[i + 1] ?? null;
				games.push([p1, p2]);
			}

			for (const [p1, p2] of games) {
				const status = p2 === null ? 'bye' : 'pending';
				await this.runAsync(
					`INSERT INTO games (player1_id, player2_id, status) VALUES (?, ?, ?)`,
					[p1, p2, status]
				);
				const gameId = (await this.getAsync(`SELECT last_insert_rowid() AS id`)).id;
				await this.runAsync(
					`INSERT INTO tournament_games (tournament_id, game_id) VALUES (?, ?)`,
					[tournamentId, gameId]
				);
			}
			return { status: 200, reply: "Next round games created" };
		} catch (error) {
			if (error instanceof Error)
				return { status: 400, reply: error.message };
			return { status: 400, reply: "Unknown error" };
		}
	}

    async getTournament(tournamentId: number): Promise<IResponse> {
        try {
            const tournament = await this.getAsync(`
				SELECT t.id,
					t.name,
					t.start_date AS startDate,
					t.winner as winnerId,
					t.owner_id AS ownerId,
                    owner.username AS ownerName,
					t.max_players AS maxPlayers,
					t.status,
                    winner.username AS winnerName
				FROM tournaments t
				LEFT JOIN users winner ON t.winner = winner.id
				LEFT JOIN users owner ON t.owner_id = owner.id
				WHERE t.id = ?
				ORDER BY t.id DESC`, [tournamentId]);
            if (!tournament)
                return { status: 404, reply: "Tournament not found" };
			const participants = await this.allAsync(
				`SELECT u.id, u.username, tp.display_name AS displayName
				FROM tournament_players tp
				LEFT JOIN users u ON tp.player_id = u.id
				WHERE tp.tournament_id = ?`,
				[tournamentId]
			);
			tournament.participants = participants;
			const games = await this.allAsync(`
				SELECT
					g.id,
					g.player1_id,
					p1.username AS player1_username,
					tp1.display_name AS player1_display_name,
					g.player2_id,
					p2.username AS player2_username,
					tp2.display_name AS player2_display_name,
					g.status,
					g.winner_id,
					w.username AS winner_username,
					g.player1_score AS score1,
					g.player2_score AS score2
				FROM tournament_games tg
				JOIN games g ON tg.game_id = g.id
				LEFT JOIN users p1 ON g.player1_id = p1.id
				LEFT JOIN users p2 ON g.player2_id = p2.id
				LEFT JOIN users w ON g.winner_id = w.id
				LEFT JOIN tournament_players tp1 ON tp1.tournament_id = tg.tournament_id AND tp1.player_id = g.player1_id
    			LEFT JOIN tournament_players tp2 ON tp2.tournament_id = tg.tournament_id AND tp2.player_id = g.player2_id
				WHERE tg.tournament_id = ?
				ORDER BY g.id ASC
			`, [tournamentId]);

			tournament.games = games.map(game => ({
				id: game.id,
				player1: game.player1_id ? { id: game.player1_id, username: game.player1_username, displayName: game.player1_display_name } : null,
				player2: game.player2_id ? { id: game.player2_id, username: game.player2_username, displayName: game.player2_display_name } : null,
				score1: game.score1,
				score2: game.score2,
				winnerId: game.winner_id,
				winnerName: game.winner_username
			}));
            return { status: 200, reply: tournament };
        } catch (error) {
            if (error instanceof Error)
                return { status: 400, reply: error.message };
            return { status: 400, reply: "Unknown error" };
        }
    }

    async reportResult(tournamentId: number, gameId: number, winnerId: number): Promise<IResponse> {
        try {
            await this.runAsync(
                `UPDATE games SET winner_id = ?, status = 'finished' WHERE id = ?`,
                [winnerId, gameId]
            );
            return { status: 200, reply: "Result reported" };
        } catch (error) {
            if (error instanceof Error)
                return { status: 400, reply: error.message };
            return { status: 400, reply: "Unknown error" };
        }
    }

	async getTournamentWinner(tournamentId: number): Promise<IResponse> {
        try {
            const winner = await this.getAsync(
				`SELECT t.winner_id AS winnerId,
					u.username AS winnerName
				FROM tournaments t
				LEFT JOIN users u ON t.winner_id = u.id
				WHERE t.id = ? AND t.status = 'finished'`, [tournamentId]
			);
			if (!winner)
				return { status: 404, reply: "Tournament not found or no winner" };
            return { status: 200, reply: winner }
        } catch (error) {
            if (error instanceof Error)
                return { status: 400, reply: error.message };
            return { status: 400, reply: "Unknown error" };
        }
	}

	async cancelTournament(tournamentId: number, userId: number): Promise<IResponse> {
		try {
			const tournament = await this.getAsync(`SELECT * FROM tournaments WHERE id = ?`, [tournamentId]);
			if (!tournament)
				return { status: 404, reply: "Tournament not found" };
			if (tournament.owner_id !== userId)
				return { status: 403, reply: "Only the tournament owner can cancel it" };
			if (tournament.status !== 'waiting')
				return { status: 400, reply: "Tournament already started or finished" };

			await this.runAsync(`DELETE FROM tournaments WHERE id = ?`, [tournamentId]);
			await this.runAsync(`DELETE FROM tournament_players WHERE tournament_id = ?`, [tournamentId]);
			await this.runAsync(`DELETE FROM tournament_games WHERE tournament_id = ?`, [tournamentId]);
			await this.runAsync(`DELETE FROM games WHERE id IN (SELECT game_id FROM tournament_games WHERE tournament_id = ?)`, [tournamentId]);

			return { status: 200, reply: "Tournament cancelled" };
		} catch (error) {
			if (error instanceof Error)
				return { status: 400, reply: error.message };
			return { status: 400, reply: "Unknown error" };
		}
	}

	async closeInProgressEntities(): Promise<void> {
		try {
			const deletedTournaments = await this.runAsync(
				`DELETE FROM tournaments WHERE status = 'in progress'`
			);
			if (deletedTournaments.changes > 0) {
				console.log(`Deleted ${deletedTournaments.changes} tournaments in progress`);
			}

			const deletedTournamentPlayers = await this.runAsync(
				`DELETE FROM tournament_players WHERE tournament_id NOT IN (SELECT id FROM tournaments)`
			);
			if (deletedTournamentPlayers.changes > 0) {
				console.log(`Deleted ${deletedTournamentPlayers.changes} tournament players with missing tournaments`);
			}

			const deletedTournamentGames = await this.runAsync(
				`DELETE FROM tournament_games WHERE tournament_id NOT IN (SELECT id FROM tournaments)`
			);
			if (deletedTournamentGames.changes > 0) {
				console.log(`Deleted ${deletedTournamentGames.changes} tournament games with missing tournaments`);
			}

			const deletedGames = await this.runAsync(
				`DELETE FROM games WHERE id NOT IN (SELECT game_id FROM tournament_games)
					OR status = 'in progress'`
			);
			if (deletedGames.changes > 0) {
				console.log(`Deleted ${deletedGames.changes} games that were not linked to tournaments or were in progress`);
			}

		} catch (error) {
			console.error(`Error closing running games: ${error instanceof Error ? error.message : "Unknown error"}`);
		}
	}
}
