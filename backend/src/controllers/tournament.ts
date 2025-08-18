import { FastifyReply, FastifyRequest } from 'fastify';
import IResponse from '../interfaces/tournament';
import { Database } from 'sqlite3';
import TournamentDatabase from '../database/tournament';

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
    const database = new TournamentDatabase(db);

	try {
		const { name, numberOfPlayers, displayName } = (req.body || {}) as { name: string, numberOfPlayers: number, displayName: string };
		if (!displayName || typeof displayName !== 'string' || displayName.trim() === "" || !/^[A-Za-z0-9_]+$/.test(displayName))
			return { status: 400, reply: "Invalid display name, only letter, underscore, and digits are allowed" };
		if (!name || typeof name !== 'string' || name.trim() === "" || !/^[A-Za-z0-9_ ]+$/.test(name))
			return { status: 400, reply: "Invalid tournament name only letters and digits are allowed" };
		if (numberOfPlayers && (typeof numberOfPlayers !== 'number' || (numberOfPlayers != 4 && numberOfPlayers != 8 &&  numberOfPlayers != 16)))
			return { status: 400, reply: "Invalid number of players" };
		const userId = (req as any).user?.id;
		const { status, reply } = await database.createTournament(name, userId, displayName, numberOfPlayers);
		return { status, reply };
	} catch (error: Error | any) {
		console.error(`Error creating tournament: ${error.message}`);
		return { status: 400, reply: error.message || "Internal Server Error" };
	}
  }

  async getAllTournaments(req: FastifyRequest, _res: FastifyReply): Promise<IResponse> {
    const db = req.server.sqlite as Database;
    const database = new TournamentDatabase(db);

	try {
		const { page = 1, pageSize = 5 } = (req.query || {}) as { page?: number, pageSize?: number };
		const pageNum = Math.max(1, Number(page));
		const pageSizeNum = Math.max(1, Math.min(100, Number(pageSize)));

		const { status, reply } = await database.getAllTournaments(pageNum, pageSizeNum);
		return { status, reply };
	} catch (error: Error | any) {
		console.error(`Error getting tournaments: ${error.message}`);
		return { status: 400, reply: error.message || "Internal Server Error" };
	}

  }

  async joinTournament(req: FastifyRequest, _res: FastifyReply): Promise<IResponse> {
    const db = req.server.sqlite as Database;
    const database = new TournamentDatabase(db);

	try {
		const tournamentId = Number((req.params as { id: string }).id);
		const { displayName } = req.body as { displayName?: string };
		const displayNameRegex = /^(?=.*[A-Za-z])[A-Za-z0-9_]+$/;
		if (!displayName || !displayNameRegex.test(displayName))
			return { status: 400, reply: "Invalid display name, only letter, underscore, and digits are allowed" };
		const userId = (req as any).user?.id;
		if (!userId || !tournamentId)
		  return { status: 400, reply: "Invalid user or tournament ID" };
		const { status, reply } = await database.joinTournament(tournamentId, userId, displayName);
		return { status, reply };

	} catch (error: Error | any) {
		console.error(`Error joining tournament: ${error.message}`);
		return { status: 400, reply: error.message || "Internal Server Error" };
	}
  }

  async unsubscribeTournament(req: FastifyRequest, _res: FastifyReply): Promise<IResponse> {
	const db = req.server.sqlite as Database;
	const database = new TournamentDatabase(db);

	try {
		const tournamentId = Number((req.params as { id: string }).id);
		const userId = (req as any).user?.id;
		if (!userId || !tournamentId)
			return { status: 400, reply: "Invalid user or tournament ID" };
		const { status, reply } = await database.unsubscribeTournament(tournamentId, userId);
		return { status, reply };
	} catch (error: Error | any) {
		console.error(`Error unsubscribing from tournament: ${error.message}`);
		return { status: 400, reply: error.message || "Internal Server Error" };
	}
  }

  async startTournament(req: FastifyRequest, _res: FastifyReply): Promise<IResponse> {
    const db = req.server.sqlite as Database;
    const database = new TournamentDatabase(db);

	try {
		const tournamentId = Number((req.params as { id: string }).id);
		const userId = (req as any).user?.id;
		if (!tournamentId)
			return { status: 400, reply: "Invalid tournament ID" };
		
		const { status, reply } = await database.startTournament(tournamentId, userId);
		return { status, reply };

	} catch (error: Error | any) {
		console.error(`Error starting tournament: ${error.message}`);
		return { status: 400, reply: error.message || "Internal Server Error" };
	}
  }

  async getTournament(req: FastifyRequest, _res: FastifyReply): Promise<IResponse> {
    const db = req.server.sqlite as Database;
    const database = new TournamentDatabase(db);

	try {
		const tournamentId = Number((req.params as { id: string }).id);
		if (!tournamentId)
		  return { status: 400, reply: "Invalid tournament ID" };
	
		const { status, reply } = await database.getTournament(tournamentId);
		return { status, reply };

	} catch (error: Error | any) {
		console.error(`Error getting tournament: ${error.message}`);
		return { status: 400, reply: error.message || "Internal Server Error" };
	}
  }

  async reportResult(req: FastifyRequest, _res: FastifyReply): Promise<IResponse> {
    const db = req.server.sqlite as Database;
    const database = new TournamentDatabase(db);

	try {
		const tournamentId = Number((req.params as { id: string }).id);
		const { gameId, winnerId } = req.body as { gameId: number, winnerId: number };
		if (!tournamentId || !gameId || !winnerId)
		  return { status: 400, reply: "Invalid parameters" };
	
		const { status, reply } = await database.reportResult(tournamentId, gameId, winnerId);
		return { status, reply };

	} catch (error: Error | any) {
		console.error(`Error reporting result: ${error.message}`);
		return { status: 400, reply: error.message || "Internal Server Error" };
	}
  }

  async cancelTournament(req: FastifyRequest, _res: FastifyReply): Promise<IResponse> {
	const db = req.server.sqlite as Database;
	const database = new TournamentDatabase(db);
	try {
		const tournamentId = Number(((req.params || {}) as { id?: string }).id);
		if (!tournamentId)
			return { status: 400, reply: "Invalid tournament ID" };

		const userId = (req as any).user?.id;
		const { status, reply } = await database.cancelTournament(tournamentId, userId);
		return { status, reply };

	} catch (error: Error | any) {
		console.error(`Error canceling tournament: ${error.message}`);
		return { status: 400, reply: error.message || "Internal Server Error" };
	}
  }
}

export const tournamentController = new TournamentController();