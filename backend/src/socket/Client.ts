import { Socket } from "socket.io";
import SocketManager from "./SocketManager";

interface IUserProfile {
	id?: string;
	username: string;
  nickname: string;
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
}

class Client {
	public id: string = '';
	public username: string;
	public socket: Socket;
	public subscriptions: string[] = [];
	public currentGameRoom?: string;
	public blockedList: string[] = [];
	private server: SocketManager;

	constructor(manager: SocketManager, socket: Socket, info: IUserProfile) {
	  this.server = manager;
	  this.socket = socket;
	  this.username = info.username;
	  this.id = info.id?.toString() || '';
	  console.log(`Client created: ${info}`);
	}
  
	inviteToGame(opponentId: string) {
	}
  
	joinGameRoom(roomId: string) {
	  this.currentGameRoom = roomId;
	  this.socket.join(roomId);
	}
  
	sendChatMessage(roomId: string, text: string) {
	}

	onSubscribeChatMessage() {
		this.subscriptions.push('chat-message');
	}

	// onChatMessage(payload: {target: string, message: string}) {
	// 	console.log(`target ${payload.target}, message ${payload.message}`)
	// 	this.socket.to(payload.target).emit('chat-message', {
	// 		fromId: this.id,
	// 		fromName: this.username,
	// 		message: payload.message,
	// 	});
	// }

	eventCaller(event: string, ...args: any[]) {
		event = `-${event}`;
		const methodName = `on${event.replace(/-([a-z])/g, (_, char) => char.toUpperCase())}`;
		if (typeof (this as any)[methodName] === 'function') {
			(this as any)[methodName](...args);
			return (true);
		}
		return (false);
 	}

	quitGame() {
	}

	public basicInfo() {
		return {
			id: this.socket.data.user.id,
			socketId: this.socket.id,
			name: this.socket.data.user.username,
		};
	}

	disconnect() {
	  this.socket.disconnect();
	}
}

export default Client;  