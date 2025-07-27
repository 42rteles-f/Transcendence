// SocketManager.ts
import { Server, Socket } from 'socket.io';
import Client from './Client';
import jwt from 'jsonwebtoken';
import { GameManagerInstance } from '../game/gameManger';
// import { jwtdecode } from '../utils/jwtdecode'; // Adjust the import path as necessary
export type Pointer<T> = (T | null);
import Pong from '../services/Games/PongGame/Pong';

interface IClient {
	id:		string;
	name:	string;
}

class SocketManager {
	private clients:	Map<string, Client> = new Map();
	private io: 		Server;
	private				testPongCounter: number = 0;
	private				pongGame: Pointer<Pong> = null;

	constructor(httpServer: any) {
		this.io = new Server(httpServer, {
			cors: {
				origin: '*',
				methods: ['GET', 'POST'],
			},
		});

		this.setupConnection();
	}

	private socketAuthMiddleware(socket: Socket, next: (err?: Error) => void) {
		const token = socket.handshake.auth.token;
		if (!token) return next(new Error("Unauthorized"));

		try {
			const user = jwt.verify(token, process.env.JWT_SECRET!);
			socket.data.user = user;
			console.log(`connected ${user}`);
			next();
		} catch (err) {
			console.log(`denied ${token}`);
			next(new Error("Unauthorized"));
		}
	}

	private setupConnection() {
		this.io.use((socket, next) => this.socketAuthMiddleware(socket, next));

		this.io.on('connection', (socket) => {
			const client = new Client(this, socket);
			this.clients.set(socket.id, client);

			socket.broadcast.emit('client-arrival', [{
					id: socket.id,
					name: socket.data.user.username
			}]);

			socket.onAny((event: string, ...args: any[]) => {
				if (!client.eventCaller(event, ...args)
					&& !this.eventCaller(event, client, ...args))
				{
					console.warn(`Unhandled event: ${event}`);
				}
			});

			socket.on('disconnect', () => {
				console.log('Client disconnected:', socket.id);
				this.clients.delete(socket.id);
				this.io.emit('client-departure', {
					id: client.socket.id,
					name: client.socket.data.user.username,
				});
			});
		});
	}

	onPongJoin(client: Client) {
		this.testPongCounter++;
		console.log(`pong counter: ${this.testPongCounter}`);
		if (this.testPongCounter >= 2){
			this.testPongCounter = 0;
			if (this.pongGame) {
				this.pongGame.destructor();
			}
			this.pongGame = new Pong(Array.from(this.clients.values()).map(c => c.socket));
			console.log("Pong game started");
		}
	}

	onPongLeave(client: Client) {
		this.testPongCounter--;
		if (this.testPongCounter < 0) {
			this.testPongCounter = 0;
		}
		console.log(`pong counter: ${this.testPongCounter}`);

		if (this.pongGame) {
			this.pongGame.destructor();
			this.pongGame = null;
			console.log("Pong game ended");
		}
	}

	onUnsubscribeSearchGame(client: Client) {
		console.log(`Player ${client.socket.data.user.username} removed from matchmaking queue`);
		GameManagerInstance.removePlayerFromQueue(client.socket.data.user.id);
	}

	onSubscribeSearchGame(client: Client) {
		console.log(`Player ${client.socket.data.user.username} added to matchmaking queue`);
		client.subscriptions.push("search-game");
		GameManagerInstance.addPlayerToQueue({
			id: client.socket.data.user.id,
			socketId: client.socket.id,
		});
		
	}

	onSubscribeClientArrival(client: Client) {
		client.subscriptions.push("client-arrival");
		const onlineClients = Array.from(this.clients.values()).map(c => ({
			id: c.socket.id,
			name: c.socket.data.user.username,
		}));
		client.socket.emit('client-arrival', onlineClients);
	}

	eventCaller(event: string, ...args: any[]) {
		event = `-${event}`;
		const methodName = `on${event.replace(/-([a-z])/g, (_, char) => char.toUpperCase())}`;
		if (typeof (this as any)[methodName] === 'function') {
			(this as any)[methodName](...args);
			return (true);
		}
		return (false);
	}


	public sendChatMessage(from: string, target: string, message: string) {
		this.io.to(target).emit('chat-message', {
			from,
			message,
		});
	}

	public addClient(client: Client) {
		this.clients.set(client.id, client);
	}

	public removeClient(id: string) {
		this.clients.delete(id);
	}

	public getClient(id: string) {
		return this.clients.get(id);
	}

	public getAllClients() {
		return Array.from(this.clients.values());
	}

	public getIo(): Server {
		return this.io;
	}
}

export default SocketManager;

			// socket.on("online-clients", () => {
			// 	const onlineClients = Array.from(this.clients.values()).map(client => ({
			// 		id: client.socket.id,
			// 		name: client.socket.data.user.username,
			// 	}));
			// 	socket.emit("online-clients", onlineClients);
			// });
