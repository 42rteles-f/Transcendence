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
				events: [{event: "disconnect", callback: () => this.onDisconnect(client)}]
			});
		});
		this.initRoom(roomName);
    }

	addEvents(clientId: string, events: EventArray) {
		const client = this.clients.get(clientId);
		if (!client) return;
		
		//console.log(`[ADD-EVENTS] Adding ${events.length} events for client ${clientId} in room ${this.room}`);
		//console.log(`[ADD-EVENTS] Events:`, events.map(e => e.event));
		
		client.events.push(...events);
		client.events.forEach(({event, callback}) => {
			client.socket.on(event, callback as any);
		});
	}

	private initRoom(roomName: string) {
		if (roomName)
			this.room = roomName
		else
		{
			const ids = Array.from(this.clients.keys()).join('-');
			const timestamp = Date.now();
			const randomId = Math.random().toString(36).substring(7);
			this.room = `pong-${ids}-${timestamp}-${randomId}`;
		}
		
		//console.log(`[ROOM-INIT] Game created with room: ${this.room}`);
		//console.log(`[ROOM-INIT] Players in this room:`, Array.from(this.clients.keys()));
		
		this.clients.forEach(client => {
			client.socket.join(this.room!);
			//console.log(`[ROOM-INIT] Socket ${client.socket.id} (user ${client.id}) joined room ${this.room}`);
		});
	}

	onDisconnect(client: Socket) {
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
		//console.log(`[BROADCAST] Room ${this.room} broadcasting to ${this.clients.size} clients`);
		this.io.to(this.room!).volatile.emit("game-state", this.state);
	}

    protected sendTo(socketId: string, event: string, payload: any) {
        this.io.to(socketId).emit(event, payload);
    }

    protected onPlayerJoin(socket: Socket): void {
		if (!socket.data) socket = this.clients.get(socket.id)!.socket;

		const client = this.clients.get(socket.data?.user.id.toString());
		socket.join(this.room!);
		if (!client || client.socket == socket)
			return ;
		client.socket = socket;
		client.socket.join(this.room!);
		client.events.forEach(({event, callback}) => {
			client.socket.on(event, callback as any);
		});
	}

    protected onPlayerLeave(socket: Socket): void {
		this.clients.get(socket.id)?.socket.leave(this.room!);
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
