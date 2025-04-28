import Fastify from 'fastify';

export const server = Fastify({
	logger: true,
	bodyLimit: 1048576
});

server.decorate('authenticate', async function (request: any, reply: any) {
	// const authHeader = request.headers['authorization']
  
	// if (!authHeader || authHeader !== 'Bearer secrettoken123') {
	//   reply.code(401).send({ error: 'Unauthorized' })
	// }
})


server.get("/", async (req, res) =>{
	res.code(200).send("test authentication and redirect accordingly");
});

const start = async (port: number) => {
	try {
		await server.listen({ port })
		console.log(`Server is running at port ${port}`);
	} catch (err) {
		server.log.error(err);
		process.exit(1);
	}
};

import "./routes/user";

start(3001);
