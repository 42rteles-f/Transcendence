import { FastifyError, FastifyReply, FastifyRequest } from 'fastify'

export const verifyBodyExistance = async (req: FastifyRequest, res: FastifyReply) => {
	if (!req.body || Object.keys(req.body).length === 0) {
		res.status(400).send({
			message: "No body found"
		});
	}
}
