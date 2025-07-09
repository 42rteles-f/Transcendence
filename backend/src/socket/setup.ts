import { Server } from 'socket.io'
import { httpServer } from '..';
import SocketManager from './SocketManager';

const socketManager = new SocketManager(httpServer);

socketManager.getIo().on("connection", (socket) => {
	socket.on("join", ({ userId }) => {
		if (userId) {
			socket.join(userId.toString());
			console.log(`User ${userId} joined room ${userId}`);
		}
	});
});

export default socketManager;

//   io.use((socket, next) => {
// 	const token = socket.handshake.auth.token;
// 	const userId = verifyTokenAndExtractUserId(token); // your function
  
// 	if (!userId) {
// 	  return next(new Error("Unauthorized"));
// 	}
  
// 	socket.data.userId = userId; // store in socket
// 	next();
//   });


