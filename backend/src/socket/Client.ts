import { Socket } from "socket.io";
import SocketManager from "./SocketManager";

class Client {
	public id: string = '';
	public socket: Socket;
	public currentGameRoom?: string;
	private server: SocketManager;

	constructor(manager: SocketManager, socket: Socket) {
	  this.server = manager;
	  this.socket = socket;
	}
  
	inviteToGame(opponentId: string) {
	}
  
	joinGameRoom(roomId: string) {
	  this.currentGameRoom = roomId;
	  this.socket.join(roomId);
	}
  
	sendChatMessage(roomId: string, text: string) {
	}

	onchatMessage(payload: {target: string, message: string}) {
		console.log(`target ${payload.target}, message ${payload.message}`)
		this.socket.to(payload.target).emit('chat-message', {
			fromId: this.socket.id,
			fromName: this.socket.data.user.username,
			message: payload.message,
		},
	);
	}

	eventCaller(event: string, ...args: any[]) {
		const methodName = `on${event.replace(/-([a-z])/g, (_, char) => char.toUpperCase())}`;
		console.log(methodName);
		if (typeof (this as any)[methodName] === 'function') {
			(this as any)[methodName](...args);
		} else {
			console.warn(`Unhandled event: ${event}`);
		};
 	}

	quitGame() {
	}
  
	disconnect() {
	  this.socket.disconnect();
	}
}

export default Client;  