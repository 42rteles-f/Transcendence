import { Server } from 'socket.io'
import { httpServer } from '..';
import Client from './Client';

const clients = new Map<string, Client>();

const io = new Server(httpServer, {
	cors: {
	  origin: '*', // adjust as needed
	  methods: ['GET', 'POST'],
	},
  });

//   io.use((socket, next) => {
// 	const token = socket.handshake.auth.token;
// 	const userId = verifyTokenAndExtractUserId(token); // your function
  
// 	if (!userId) {
// 	  return next(new Error("Unauthorized"));
// 	}
  
// 	socket.data.userId = userId; // store in socket
// 	next();
//   });


  io.on('connection', (socket) => {
	console.log('Client connected:', socket.id);
	
	// if (!clients.has(socket.id))
	// 	clients.set(socket.id, new Client(socket.id, socket));
	// else
	// 	clients.get(socket.id)!.socket = socket;

	socket.on('chat-message', (msg) => {
		console.log('Received message:', msg);
		
		socket.broadcast.emit('chat-message', msg);
	});

	socket.on('disconnect', () => {
		console.log('Client disconnected:', socket.id);
	});
});

