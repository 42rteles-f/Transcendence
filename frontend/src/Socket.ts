import { Pointer } from './PageManager';
import { io, Socket as SocketIo } from 'socket.io-client';
import { routes } from './routes';

class Socket {
	private	static socket:			Pointer<SocketIo> = null;

	static init(): boolean {
		if (this.socket) {
			console.warn("Socket already created");
			return true;
		}

		const apiUrl = import.meta.env.API_URL || "http://localhost:3000";

		this.socket = io(apiUrl, {
			transports: ['websocket'],
			auth: {
				token: localStorage.getItem("authToken") || ""
			}
		});

		this.socket.on('connect', () => {
			console.log('Connected to server!', this.socket!.id);
		});
		
		this.socket.on('connect_error', (err) => {
			console.error('Socket connection error:', err.message);
		});

		this.socket.on('disconnect', () => {
			console.log('Disconnected from server');
		});

		return (!!this.socket);
	}

	static addEventListener(event: string, callback: (...args: any[]) => void): void {
		if (!this.socket) {
			console.error("Socket not initialized");
			return;
		}
		// this.socket.emit(`subscribe-${event}`);
		this.socket.on(event, callback);
	}

	static notifyEventListener(event: string, callback: (...args: any[]) => void): void {
		if (!this.socket) {
			console.error("Socket not initialized");
			return;
		}
		this.socket.emit(`subscribe-${event}`);
		this.socket.on(event, callback);
	}

	static removeEventListener(event: string, callback: (...args: any[]) => void): void {
		if (!this.socket) {
			console.error("Socket not initialized");
			return;
		}
		this.socket.emit(`unsubscribe-${event}`);
		this.socket.off(event, callback);
	}

	static emit(event: string, ...args: any[]): void {
		if (!this.socket) {
			console.error("Socket not initialized");
			return;
		}
		this.socket.emit(event, ...args);
	}

	static	disconnect(): void {
		if (!this.socket) {
			console.error("Socket not initialized");
			return;
		}
		this.socket.disconnect();
		this.socket = null;
	}
}

export default Socket;