import { FastifyReply, FastifyRequest } from 'fastify';
import IResponse from '../interfaces/tournament';
import TournamentService from '../services/tournament';
import { Database } from 'sqlite3';

declare module 'fastify' {
  interface FastifyInstance {
    sqlite: Database;
    io?: any;
  }
}

class TournamentController {
  constructor () {}

  async createTournament(req: FastifyRequest, _res: FastifyReply): Promise<IResponse> {
    const db = req.server.sqlite as Database;
    const service = new TournamentService(db);

	try {
		const { name, start_date, max_players } = req.body as { name: string, start_date?: string, max_players?: number };
		if (!name || typeof name !== 'string')
			return { status: 400, reply: "Invalid tournament name" };
		if (max_players && (typeof max_players !== 'number' || max_players <= 0 || max_players > 16))
			return { status: 400, reply: "Invalid max players" };
		const userId = (req as any).user?.id;
		const { status, reply } = await service.createTournament(name, userId, start_date, max_players);
		return { status, reply };
	} catch (error: Error | any) {
		console.error(`Error creating tournament: ${error.message}`);
		return { status: 500, reply: error.message || "Internal Server Error" };
	}
  }

  async getAllTournaments(req: FastifyRequest, _res: FastifyReply): Promise<IResponse> {
    const db = req.server.sqlite as Database;
    const service = new TournamentService(db);

	try {
		const { page = 1, pageSize = 10 } = req.query as { page?: number, pageSize?: number };
		const pageNum = Math.max(1, Number(page));
		const pageSizeNum = Math.max(1, Math.min(100, Number(pageSize)));

		const { status, reply } = await service.getAllTournaments(pageNum, pageSizeNum);
		return { status, reply };
	} catch (error: Error | any) {
		console.error(`Error getting tournaments: ${error.message}`);
		return { status: 500, reply: error.message || "Internal Server Error" };
	}

  }

  async joinTournament(req: FastifyRequest, _res: FastifyReply): Promise<IResponse> {
    const db = req.server.sqlite as Database;
    const service = new TournamentService(db);

	try {
		const tournamentId = Number((req.params as { id: string }).id);
		const userId = (req as any).user?.id;
		if (!userId || !tournamentId)
		  return { status: 400, reply: "Invalid user or tournament ID" };
	
		const { status, reply } = await service.joinTournament(tournamentId, userId);
		return { status, reply };

	} catch (error: Error | any) {
		console.error(`Error joining tournament: ${error.message}`);
		return { status: 500, reply: error.message || "Internal Server Error" };
	}
  }

  async startTournament(req: FastifyRequest, _res: FastifyReply): Promise<IResponse> {
    const db = req.server.sqlite as Database;
    const service = new TournamentService(db);

	try {
		const tournamentId = Number((req.params as { id: string }).id);
		const userId = (req as any).user?.id;
		if (!tournamentId)
			return { status: 400, reply: "Invalid tournament ID" };
		
		const { status, reply } = await service.startTournament(tournamentId, userId);
		return { status, reply };

	} catch (error: Error | any) {
		console.error(`Error starting tournament: ${error.message}`);
		return { status: 500, reply: error.message || "Internal Server Error" };
	}
  }

  async getTournament(req: FastifyRequest, _res: FastifyReply): Promise<IResponse> {
    const db = req.server.sqlite as Database;
    const service = new TournamentService(db);

	try {
		const tournamentId = Number((req.params as { id: string }).id);
		if (!tournamentId)
		  return { status: 400, reply: "Invalid tournament ID" };
	
		const { status, reply } = await service.getTournament(tournamentId);
		return { status, reply };

	} catch (error: Error | any) {
		console.error(`Error getting tournament: ${error.message}`);
		return { status: 500, reply: error.message || "Internal Server Error" };
	}
  }

  async reportResult(req: FastifyRequest, _res: FastifyReply): Promise<IResponse> {
    const db = req.server.sqlite as Database;
    const service = new TournamentService(db);

	try {
		const tournamentId = Number((req.params as { id: string }).id);
		const { gameId, winnerId } = req.body as { gameId: number, winnerId: number };
		if (!tournamentId || !gameId || !winnerId)
		  return { status: 400, reply: "Invalid parameters" };
	
		const { status, reply } = await service.reportResult(tournamentId, gameId, winnerId);
		return { status, reply };

	} catch (error: Error | any) {
		console.error(`Error reporting result: ${error.message}`);
		return { status: 500, reply: error.message || "Internal Server Error" };
	}
  }
}

export const tournamentController = new TournamentController();