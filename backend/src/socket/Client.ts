import { Socket } from "socket.io";

class Client {
	public userId: string;
	public socket: Socket;
	public currentGameRoom?: string;
  
	constructor(userId: string, socket: Socket) {
	  this.userId = userId;
	  this.socket = socket;
	}
  
	inviteToGame(opponentId: string) {
	}
  
	joinGameRoom(roomId: string) {
	  this.currentGameRoom = roomId;
	  this.socket.join(roomId);
	}
  
	sendChatMessage(roomId: string, text: string) {
	  this.socket.to(roomId).emit('chatMessage', {
		from: this.userId,
		text,
	  });
	}
  
	quitGame() {
	}
  
	disconnect() {
	  this.socket.disconnect();
	}
}

export default Client;  