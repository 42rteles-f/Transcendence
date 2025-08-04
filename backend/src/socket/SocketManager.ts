// SocketManager.ts
import Matchmaker from "./Matchmaker";
import { Server, Socket } from "socket.io";
import Client from "./Client";
import jwt from "jsonwebtoken";
import { GameManagerInstance } from "../game/gameManger";
export type Pointer<T> = T | null;
import Pong from "../services/Games/PongGame/Pong";
import { Tournament } from "../services/Tournament/Tournament";
import { dbLite } from "../index";
import UserDatabase from "../database/user";

interface IUserProfile {
    id?: string;
    username: string;
    nickname: string;
    gamesPlayed: number;
    gamesWon: number;
    gamesLost: number;
}

class SocketManager {
    private clients: Map<string, Client> = new Map();
    private io: Server;
    private matchmaker: Matchmaker | null = null;
    private tournamentCounter: Socket[] = [];
    private userDatabase?: UserDatabase;

    constructor(httpServer: any) {
        this.io = new Server(httpServer, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"],
            },
        });
        this.userDatabase = new UserDatabase(dbLite);
        console.log(`db connected: ${dbLite}`);
        this.matchmaker = new Matchmaker();
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

    getUserData(id: number): Promise<IUserProfile | null> {
        return this.userDatabase!.profile(id)
            .then((result) => {
                if (result && result.reply) {
                    return result.reply as IUserProfile;
                }
                return null;
            })
            .catch((err) => {
                console.error(`Error fetching user data: ${err.message}`);
                return null;
            });
    }

    private setupConnection() {
        this.io.use((socket, next) => this.socketAuthMiddleware(socket, next));

        this.io.on("connection", async (socket) => {
            const clientData = await this.getUserData(socket.data.user.id);
            if (!clientData) {
                console.error(
                    `User data not found for socket ID: ${socket.id}`
                );
                socket.disconnect();
                return;
            }

            const client = new Client(this, socket, clientData!);
            this.clients.set(socket.id, client);

            socket.broadcast.emit("client-arrival", [client.basicInfo()]);

            socket.onAny((event: string, ...args: any[]) => {
                if (
                    !client.eventCaller(event, ...args) &&
                    !this.eventCaller(event, client, ...args)
                ) {
                    console.warn(`Unhandled event: ${event}`);
                }
            });

            socket.on("disconnect", () => {
                console.log("Client disconnected:", socket.id);
                this.io.emit("client-departure", client.basicInfo());
                this.clients.delete(socket.id);
            });
        });
    }

    onPongLocalPlay(client: Client) {
        new Pong([client.socket, client.socket]);
    }

    onPongMatchFind(client: Client) {
        this.matchmaker!.addToQueue(client);
    }

    onPongMatchLeave(client: Client) {
        this.matchmaker!.removeFromQueue(client);
    }

    onUnsubscribeSearchGame(client: Client) {
        console.log(
            `Player ${client.socket.data.user.username} removed from matchmaking queue`
        );
        GameManagerInstance.removePlayerFromQueue(client.socket.data.user.id);
    }

    onSubscribeSearchGame(client: Client) {
        console.log(
            `Player ${client.socket.data.user.username} added to matchmaking queue`
        );
        client.subscriptions.push("search-game");
        GameManagerInstance.addPlayerToQueue({
            id: client.socket.data.user.id,
            socketId: client.socket.id,
        });
    }

    onSubscribeClientArrival(client: Client) {
        client.subscriptions.push("client-arrival");
        const onlineClients = Array.from(this.clients.values()).map((c) =>
            c.basicInfo()
        );
        client.socket.emit("client-arrival", onlineClients);
    }

    eventCaller(event: string, ...args: any[]) {
        event = `-${event}`;
        const methodName = `on${event.replace(/-([a-z])/g, (_, char) =>
            char.toUpperCase()
        )}`;
        if (typeof (this as any)[methodName] === "function") {
            (this as any)[methodName](...args);
            return true;
        }
        return false;
    }

    public sendChatMessage(from: string, target: string, message: string) {
        this.io.to(target).emit("chat-message", {
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

    public onTournamentJoin(client: Client) {
        this.tournamentCounter.push(client.socket);
        if (this.tournamentCounter.length > 3)
            new Tournament(this.tournamentCounter);
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
