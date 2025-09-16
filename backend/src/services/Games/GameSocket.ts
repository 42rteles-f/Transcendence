// GameSocket.ts
import { Namespace, Socket } from "socket.io";

export interface PongScore {
	playerId: string;
	score: number;
}

export type EventArray = Array<{event: string, callback: Function}>;

interface Player {
	id: string;
	socket: Socket;
	events: EventArray;
}

abstract class GameSocket {
	private 	io:				Namespace;
    protected	room:			string | null = null;
	protected	state:			any = {};
    protected	clients:		Map<string, Player> = new Map();
    private		tickHandle?:	NodeJS.Timeout;
    private		tickInterval:	number;

    constructor(
        clients: Socket[],
		roomName: string,
	) {
		this.tickInterval = 1000 / 60;
		this.io = clients[0].nsp;
		clients.forEach(client => {
			this.clients.set(client.data.user.id.toString(), {
				id: client.data.user.id.toString(),
				socket: client,
				events: new Array()
			});
			client.on("disconnect", () => this.onDisconnect(client));
		});
		this.initRoom(roomName);
    }

	addEvents(clientId: string, events: EventArray) {
		this.clients.get(clientId)?.events.push(...events);
		this.clients.get(clientId)?.events.forEach(({event, callback}) => {
			this.clients.get(clientId)?.socket.on(event, callback as any);
		});
	}

	private initRoom(roomName: string) {
		if (roomName)
			this.room = roomName
		else
		{
			const ids = Array.from(this.clients.keys()).join('-');
			const date = `-${new Date().toISOString().split('T')[0]}`;
			this.room = `pong-${ids}-${date}`;
		}
		this.clients.forEach(client => {
			client.socket.join(this.room!);
		});
	}

	onDisconnect = (client: Socket) => {
		this.handleDisconnect(client);
		this.onPlayerLeave(client);
		this.clients.delete(client.id);
		client.leave(this.room!);
	}

    protected handleDisconnect(client: Socket) {
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

    protected stopGameLoop() {
        if (this.tickHandle) {
            clearInterval(this.tickHandle);
            this.tickHandle = undefined;
        }
    }

	protected broadcast(event: string, payload: any) {
		this.io.to(this.room!).emit(event, payload);
	}

    protected broadcastState() {
        this.io.to(this.room!).volatile.emit("game-state", this.state);
    }

    protected sendTo(socketId: string, event: string, payload: any) {
        this.io.to(socketId).emit(event, payload);
    }

    protected onPlayerJoin(socket: Socket): void {
		const client = this.clients.get(socket.data.user.id.toString());
		if (!client) return ;
		client.socket = socket;
		client.socket.join(this.room!);
		client.events.forEach(({event, callback}) => {
			client.socket.on(event, callback as any);
		});
		client.socket.on("disconnect", () => this.onDisconnect(client.socket));
	}

    protected onPlayerLeave(socket: Socket): void {
		// this.clients.get(socket.id)?.events.forEach(({event, callback}) => {
		// 	socket.removeListener(event, (...args: any[]) => callback(...args));
		// });
		if (this.clients.size === 0) {
			this.destructor();
		}
	}

    protected abstract onTick(): void;

	public	destructor() {
		console.log(`GameSocket destructor called for room: ${this.room}`);
		this.stopGameLoop();
		this.clients.forEach(client => {
			client.socket.leave(this.room!);
			client.events.forEach(({event, callback}) => {
				client.socket.removeListener(event, callback as any);
			});
			client.socket.removeListener("disconnect", () => this.onDisconnect(client.socket));
		});
		this.clients.clear();
	}

}

export default GameSocket;

// 	eventCaller(event: string, ...args: any[]) {
// 		event = `-${event}`;
// 		const methodName = `on${event.replace(/-([a-z])/g, (_, char) => char.toUpperCase())}`;
// 		if (typeof (this as any)[methodName] === 'function') {
// 			(this as any)[methodName](this, ...args);
// 			return (true);
// 		}
// 		return (false);
//  	}
