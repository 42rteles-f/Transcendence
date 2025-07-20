import { Database } from 'sqlite3';
import TournamentDatabase from '../database/tournament';
import IResponse from '../interfaces/tournament';

export default class TournamentService {
    private db: TournamentDatabase;

    constructor(db: Database) {
        this.db = new TournamentDatabase(db);
    }

    async createTournament(
        name: string,
		userId: number,
        maxPlayers?: number
    ): Promise<IResponse> {
        return await this.db.createTournament(name, userId, maxPlayers);
    }

    async getAllTournaments(pageNum: number, pageSizeNum: number): Promise<IResponse> {
        return await this.db.getAllTournaments(pageNum, pageSizeNum);
    }

    async joinTournament(
        tournamentId: number,
        userId: number
    ): Promise<IResponse> {
        return await this.db.joinTournament(tournamentId, userId);
    }

	async unsubscribeTournament(
		tournamentId: number,
		userId: number
	): Promise<IResponse> {
		return await this.db.unsubscribeTournament(tournamentId, userId);
	}

    async startTournament(
        tournamentId: number,
		userId: number
    ): Promise<IResponse> {
        return await this.db.startTournament(tournamentId, userId);
    }

    async getTournament(
        tournamentId: number
    ): Promise<IResponse> {
        return await this.db.getTournament(tournamentId);
    }

    async reportResult(
        tournamentId: number,
        gameId: number,
        winnerId: number
    ): Promise<IResponse> {
        return await this.db.reportResult(tournamentId, gameId, winnerId);
    }

	async cancelTournament(
		tournamentId: number,
		userId: number
	): Promise<IResponse> {
		return await this.db.cancelTournament(tournamentId, userId);
	}
}
