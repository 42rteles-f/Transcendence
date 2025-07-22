// GameSocket.ts
import { Server, Socket } from "socket.io";
import SocketManager from "../../socket/SocketManager";

abstract class GameSocket {
    protected io: Server;
    protected socket: Socket;
    protected manager: SocketManager;
    protected room: string;
	protected state: any = {};
    protected clients: Map<string, Socket> = new Map();
    private tickHandle?: NodeJS.Timeout;
    private tickInterval: number;

    constructor(
        manager: SocketManager,
        socket: Socket,
		room: string,
    ) {
        this.manager = manager;
        this.io = manager.getIo();
        this.socket = socket;
		this.room = room;
		this.tickInterval = 1000 / 60; // default to 60 FPS
        // join the socket to the game room
        socket.join(this.room);
        this.clients.set(socket.id, socket);

        // wire up socket events to the generic dispatcher
        socket.onAny((event, ...args) => this.eventCaller(event, ...args));

        // handle disconnect
        socket.on("disconnect", () => this.handleDisconnect());

        this.onInit();
    }

    /** Called once at construction for subclass to hook extra events */
    protected abstract onInit(): void;

    /** Dispatch any incoming event to a handler method if it exists */
	eventCaller(event: string, ...args: any[]) {
		event = `-${event}`;
		const methodName = `on${event.replace(/-([a-z])/g, (_, char) => char.toUpperCase())}`;
		if (typeof (this as any)[methodName] === 'function') {
			(this as any)[methodName](...args);
			return (true);
		}
		return (false);
 	}

    /** Example disconnect cleanup */
    protected handleDisconnect() {
        this.clients.delete(this.socket.id);
        this.onPlayerLeave(this.socket);
        this.io.to(this.room).emit("player-left", { id: this.socket.id });
        // if room empty, maybe stop loop?
        if (this.clients.size === 0) {
            this.stopGameLoop();
            this.onRoomEmpty();
        }
    }

    protected startGameLoop() {
        if (this.tickHandle) return;

        this.tickHandle = setInterval(() => {
            this.onTick(this.state);
            this.broadcastState();
        }, this.tickInterval);
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

    protected abstract onPlayerJoin(socket: Socket, info?: C): void;

    protected abstract onPlayerLeave(socket: Socket): void;

    protected abstract onTick(state: S): void;

    protected abstract onRoomEmpty(): void;
}

export default GameSocket;