// GameSocket.ts
import { Socket } from "socket.io";
import SocketManager from "../../socket/SocketManager";

export interface PongScore {
	playerId: string;
	score: number;
}

interface Player {
	id: string;
}

abstract class GameSocket {
    // protected	manager: SocketManager;
    protected	room: string | null = null;
	protected	state: any = {};
    protected	clients: Map<string, Socket> = new Map();
    private		tickHandle?: NodeJS.Timeout;
    private		tickInterval: number;

    constructor(
        clients: Socket[],
	) {
		this.tickInterval = 1000 / 60;
		clients.forEach(client => {
			this.clients.set(client.id, client);
		});
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

    protected handleDisconnect() {
        this.clients.delete(this.socket.id);
        this.onPlayerLeave(this.socket);
        // this.io.to(this.room).emit("player-left", { id: this.socket.id });
        // if room empty, maybe stop loop?
        if (this.clients.size === 0) {
            this.stopGameLoop();
            this.onRoomEmpty();
        }
    }

    protected startGameLoop() {
        if (this.tickHandle) return;

        this.tickHandle = setInterval(() => {
            this.onTick();
            this.broadcastState();
        }, this.tickInterval);
    }

	protected	addEventHook(player: Player, event: string, callback: (...args: any[]) => void) {
		
	}

	protected removeEventHook(event: string, callback: (...args: any[]) => void) {
		this.clients.forEach((client) => {
			client.off(event, callback);
		});
	}

    protected stopGameLoop() {
        if (this.tickHandle) {
            clearInterval(this.tickHandle);
            this.tickHandle = undefined;
        }
    }

    protected broadcastState() {
        this.io.to(this.room).emit("state-update", this.state);
    }

    protected sendTo(socketId: string, event: string, payload: any) {
        this.io.to(socketId).emit(event, payload);
    }

    // protected abstract onPlayerJoin(socket: Socket, info?: C): void;

    // protected abstract onPlayerLeave(socket: Socket): void;

    protected abstract onTick(): void;

}

export default GameSocket;