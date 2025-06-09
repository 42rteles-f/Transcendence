import { FastifyInstance } from 'fastify';

async function loginRoutes(server: FastifyInstance)
{
	server.post('/login', async (request, reply) => {
		console.log('Login route hit');
		return (reply.status(200).send({
			message: 'Login successful',
			user: {
				id: 1,
				name: 'John Doe',
			}
		}))
	});
}

export default loginRoutes;