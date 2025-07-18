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
        start_date?: string,
        max_players?: number
    ): Promise<IResponse> {
        return await this.db.createTournament(name, userId, start_date, max_players);
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
}
