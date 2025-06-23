import { Server } from 'socket.io'
import { httpServer } from '..';
import SocketManager from './SocketManager';

const socketManager = new SocketManager(httpServer);

//   io.use((socket, next) => {
// 	const token = socket.handshake.auth.token;
// 	const userId = verifyTokenAndExtractUserId(token); // your function
  
// 	if (!userId) {
// 	  return next(new Error("Unauthorized"));
// 	}
  
// 	socket.data.userId = userId; // store in socket
// 	next();
//   });


