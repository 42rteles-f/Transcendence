// SocketManager.ts
import { Server, Socket } from 'socket.io';
import Client from './Client';
import jwt from 'jsonwebtoken';
// import { jwtdecode } from '../utils/jwtdecode'; // Adjust the import path as necessary
export type Pointer<T> = (T | undefined);

interface IClient {
	id: string;
}

class SocketManager {
	private clients:	Map<string, Client> = new Map();
	private io: 		Server;

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

			this.broadcastClientArrive();
		
			socket.onAny((event: string, ...args: any[]) => {
				// if (event.startsWith("client-"))
					client.eventCaller(event, ...args);
				// else if (event.startsWith("server-"))
				// 	this.eventCaller(event, client, ...args);
			});

			socket.on('disconnect', () => {
				console.log('Client disconnected:', socket.id);
				this.clients.delete(socket.id);
				this.broadcastClientLeft(client);
			});
		});
	}

	broadcastClientArrive() {
		const onlineClients = Array.from(this.clients.values()).map(c => ({
			id: c.socket.id,
			name: c.socket.data.user.username,
		}));
		this.io.emit('client-arrival', onlineClients);
	}

	broadcastClientLeft(client: Client) {
		this.io.emit('client-departure', {
			id: client.socket.id,
			name: client.socket.data.user.username,
		});
	}

	eventCaller(event: string, ...args: any[]) {
		event = `-${event}`;
		const methodName = `on${event.replace(/-([a-z])/g, (_, char) => char.toUpperCase())}`;
		console.log(methodName);
		if (typeof (this as any)[methodName] === 'function') {
			(this as any)[methodName](...args);
			return (true);
		}
		console.warn(`Unhandled event: ${event}`);
 	}


	public sendChatMessage(from: string, target: string, message: string) {
		this.io.to(target).emit('chat-message', {
			from,
			message,
		});
	}

	public addClient(client: Client) {
		// this.clients.set(client.id, client);
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
}

export default SocketManager;

			// socket.on("online-clients", () => {
			// 	const onlineClients = Array.from(this.clients.values()).map(client => ({
			// 		id: client.socket.id,
			// 		name: client.socket.data.user.username,
			// 	}));
			// 	socket.emit("online-clients", onlineClients);
			// });
