import { FastifyReply, FastifyRequest } from 'fastify';
import { Get, Post, Router } from '.';
import { tournamentController } from '../controllers/tournament';

@Router()
class TournamentRoutes {

    @Post("create", true, [])
    async createTournament(req: FastifyRequest, res: FastifyReply) {
        const { status, reply } = await tournamentController.createTournament(req, res);
        res.status(status).send({ message: reply });
    }

    @Get("all", true, [])
    async getAllTournaments(req: FastifyRequest, res: FastifyReply) {
        const { status, reply } = await tournamentController.getAllTournaments(req, res);
        res.status(status).send({ message: reply });
    }

    @Post(":id/join", true, [])
    async joinTournament(req: FastifyRequest, res: FastifyReply) {
        const { status, reply } = await tournamentController.joinTournament(req, res);
        res.status(status).send({ message: reply });
    }

    @Post(":id/start", true, [])
    async startTournament(req: FastifyRequest, res: FastifyReply) {
        const { status, reply } = await tournamentController.startTournament(req, res);
        res.status(status).send({ message: reply });
    }

    @Get(":id", true, [])
    async getTournament(req: FastifyRequest, res: FastifyReply) {
        const { status, reply } = await tournamentController.getTournament(req, res);
        res.status(status).send({ message: reply });
    }

    @Post(":id/report-result", true, [])
    async reportResult(req: FastifyRequest, res: FastifyReply) {
        const { status, reply } = await tournamentController.reportResult(req, res);
        res.status(status).send({ message: reply });
    }
}

export {}