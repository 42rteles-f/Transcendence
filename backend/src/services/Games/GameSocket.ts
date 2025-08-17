// GameSocket.ts
import { Namespace, Socket } from "socket.io";

export interface PongScore {
	playerId: string;
	score: number;
}

interface Player {
	id: string;
}

abstract class GameSocket {
	private 	io: Namespace;
    protected	room: string | null = null;
	protected	state: any = {};
    protected	clients: Map<string, Socket> = new Map();
    private		tickHandle?: NodeJS.Timeout;
    private		tickInterval: number;

    constructor(
        clients: Socket[],
	) {
		this.tickInterval = 1000 / 60;
		this.io = clients[0].nsp;
		clients.forEach(client => {
			this.clients.set(client.id, client);
		});
		this.clients.forEach(client => {
			client.on("pong-match-leave", () => {
				this.handleDisconnect(client);
			});
		})
		this.initRoom();
    }

	private initRoom() {
		const ids = Array.from(this.clients.keys()).join('-');
		const date = `-${new Date().toISOString().split('T')[0]}`;
		this.room = `pong-${ids}-${date}`;

		this.clients.forEach(client => {
			client.join(this.room!);
		});
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

    protected handleDisconnect(client: Socket) {
		client.removeAllListeners("pong-match-leave");
		client.leave(this.room!);
		this.clients.delete(client.id);
        if (this.clients.size === 0) {
            this.destructor();
        }
    }

    protected startGameLoop() {
        if (this.tickHandle) return;

        this.tickHandle = setInterval(() => {
            this.onTick();
            this.broadcastState();
		},
		this.tickInterval);
    }

	protected	addEventHook(player: Socket, event: string, callback: (...args: any[]) => void) {
		player.on(event, callback);
	}

	protected removeEventHook(event: string): void {
		this.clients.forEach((client) => {
			client.removeAllListeners(event);
		});
	}
	
	protected clientRemoveEventHook(client: Socket, event: string): void {
			client.removeAllListeners(event);
	}

    protected stopGameLoop() {
        if (this.tickHandle) {
            clearInterval(this.tickHandle);
            this.tickHandle = undefined;
        }
    }

    protected broadcastState() {
        this.io.to(this.room!).volatile.emit("pong-state", this.state);
    }

    protected sendTo(socketId: string, event: string, payload: any) {
        this.io.to(socketId).emit(event, payload);
    }

    // protected abstract onPlayerJoin(socket: Socket, info?: C): void;

    // protected abstract onPlayerLeave(socket: Socket): void;

    protected abstract onTick(): void;

	public	destructor() {
		console.log(`GameSocket destructor called for room: ${this.room}`);
		this.stopGameLoop();
		this.clients.forEach(client => {
			client.leave(this.room!);
		});
		this.removeEventHook("pong-match-leave");
		this.clients.clear();
	}

}

export default GameSocket;