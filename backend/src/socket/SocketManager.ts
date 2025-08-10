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
    id?: 			string;
    username:		string;
    nickname:		string;
    gamesPlayed:	number;
    gamesWon:		number;
    gamesLost: 		number;
}

class SocketManager {
    private clients:			Map<string, Client> = new Map();
    public io:					Server;
    private matchmaker:			Matchmaker | null = null;
    private tournamentCounter:	Socket[] = [];
    private userDatabase?:		UserDatabase;

    constructor(httpServer: any) {
        this.io = new Server(httpServer, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"],
            },
        });
        this.userDatabase = new UserDatabase(dbLite);
        console.log(`db connected: ${dbLite}`);
        this.matchmaker = new Matchmaker(this);
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

    async getUserData(id: number): Promise<IUserProfile | null> {
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
			const client = await this.createClient(socket);
			if (!client) return ;

			this.authorizedBroadcast(client, "client-arrival", [client.basicInfo()]);
            socket.onAny((event: string, ...args: any[]) => {
                if (
                    !client.eventCaller(event, ...args) &&
                    !this.eventCaller(event, client, ...args))
				{
                    console.warn(`Unhandled event: ${event}`);
                } else {
					console.log(`Event ${event} handled: ${client.id}`);	
				}
            });

            socket.on("disconnect", () => {
                console.log("Client disconnected:", socket.id);
				this.authorizedBroadcast(client, "client-derparture", [client.basicInfo()]);
                this.clients.delete(socket.id);
            });
        });
    }

	async createClient(socket: Socket) {
		const clientData = await this.getUserData(socket.data.user.id);
		if (!clientData) {
			console.error(
				`User data not found for socket ID: ${socket.id}`
			);
			socket.disconnect();
			return undefined;
		}

		const client = new Client(this, socket, clientData!);
		this.clients.set(socket.id, client);
		return (client);
	}

	onInvitePong(host: Client, { target }: { target: string }) {
		const targetClient = this.getClientById(target)!;
		if (!this.authorizeContact(host, targetClient)) {
			console.error(`Unauthorized invite from ${host.id} to ${target}`);
			return;
		}
		this.matchmaker!.createInvite(host, targetClient);
	}

	onInviteCancel(host: Client, { target }: { target: string }) {
		if (!this.authorizeContact(host, this.getClientById(target)!)) {
			console.error(`Unauthorized invite from ${host.id} to ${target}`);
			return;
		}
		this.matchmaker!.removeInvite(host);
	}

	onInvitePongAccept(guest: Client, { host }: { host: string }) {
		this.matchmaker!.joinInvite(this.getClientById(host)!, guest);
	}

	onBlockClient(client: Client, { targetId }: { targetId: string }) {
		client.blockedList.push(targetId);
		console.log(`Client ${client.id} blocked ${targetId}`);
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

	onChatMessage(client: Client, payload: { target: string, message: string }) {
		console.log(`target ${payload.target}, message ${payload.message}`)
		if (!this.authorizeContact(client, this.clients.get(payload.target)!)) {
			console.error(`Unauthorized chat message from ${client.id} to ${payload.target}`);
			return;
		}
		client.socket.to(payload.target).emit('chat-message', {
			fromId: client.id,
			fromName: client.username,
			message: payload.message,
		});
	}

	authorizeContact(client: Client, target: Client): boolean {
		if (!client || !target || client.id == target.id ||
			target.blockedList.includes(client.id) ||
			client.blockedList.includes(target.id)
		) {
			console.log(`auth false: ${client?.id}, ${target?.id}`)
			return (false);
		}
		return (true);
	}

	authorizedBroadcast(client: Client, event: string, payload: any) {
		this.clients.forEach((target) => {
			if (!this.authorizeContact(client, target))
				return;
			target.socket.emit(event, payload);
		});
	}

    onSubscribeClientArrival(client: Client) {
        client.subscriptions.push("client-arrival");
        let onlineClients = Array.from(this.clients.values()).map((target) => {
			if (!this.authorizeContact(client, target))
				return ;
			return target.basicInfo();
		})
		.filter(Boolean);
		console.log(`Online clients: ${onlineClients}`);
		onlineClients.unshift({ id: "system", socketId: "-1", name: "server"});

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

    public removeClient(id: string) {
        this.clients.delete(id);
    }

    public getClientBySocket(socketId: string) {
        return (this.clients.get(socketId));
    }

	public getClientById(id: string) {
		return (Array.from(this.clients.values()).find(client => client.id === id));
	}

    public onTournamentJoin(client: Client) {
        this.tournamentCounter.push(client.socket);
        if (this.tournamentCounter.length > 3)
            new Tournament(this.tournamentCounter);
    }

	serverChat(target: string, payload: any) {
		this.io.to(target).emit("chat-message", {
			fromId: "system",
			fromName: "server",
			message: payload
		})
	}
}

export default SocketManager;
