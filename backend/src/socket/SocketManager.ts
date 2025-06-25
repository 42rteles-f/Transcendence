// SocketManager.ts
import { Server, Socket } from 'socket.io';
import Client from './Client';

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

	private setupConnection() {
		this.io.on('connection', (socket) => {
			const client = new Client(this, socket);
			this.clients.set(socket.id, client);

			socket.on('chat-message', (msg) => {
				console.log('Received message:', msg);

				socket.broadcast.emit('chat-message', `${msg.target}: ${msg.message}`);
			});

			socket.onAny((event: string, ...args: any[]) => {
				client.eventCaller(event, ...args);
			});

			socket.on('disconnect', () => {
				console.log('Client disconnected:', socket.id);
				this.clients.delete(socket.id);
			});
		});
	}

	eventCaller(socket: Socket, event: string, ...args: any[]) {
		const methodName = `on${event.replace(/-([a-z])/g, (_, char) => char.toUpperCase())}`;
		if (typeof (this as any)[methodName] === 'function') {
			(this as any)[methodName](socket, ...args);
		} else {
			console.warn(`Unhandled event: ${event}`);
		};
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