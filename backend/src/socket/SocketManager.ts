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
import { json } from 'node:stream/consumers';


function isIntegerString(str: string): boolean {
	return (/^[0-9]+$/.test(str));
}

interface IUserProfile {
    id?: 			string;
    username:		string;
    nickname:		string;
    gamesPlayed:	number;
    gamesWon:		number;
    gamesLost: 		number;
}

interface ITournamentCreation {
	name:				string;
	numberOfPlayers:	number;
	displayName:		string;
};

class SocketManager {
    private clients:			Map<string, Client> = new Map();
    public io:					Server;
    private matchmaker:			Matchmaker;
    private userDatabase:		UserDatabase;

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
				// handle try
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
		if (!this.authorizeContact(host, targetClient, true)) {
			console.error(`Unauthorized invite from ${host.id} to ${target}`);
			return;
		}
		this.matchmaker!.createInvite(host, targetClient);
	}

	onInviteCancel(host: Client, { target }: { target: string }) {
		if (!this.authorizeContact(host, this.getClientById(target)!, true)) {
			console.error(`Unauthorized invite from ${host.id} to ${target}`);
			return;
		}
		this.matchmaker!.removeInvite(host);
	}

	onInvitePongAccept(guest: Client, { host }: { host: string }) {
		const serverHost = this.getClientById(host)!;
		if (!this.authorizeContact(guest, serverHost, true)) {
			return;
		}
		this.matchmaker!.joinInvite(serverHost, guest);
	}

	onBlockClient(client: Client, { targetId }: { targetId: string }) {
		const targetClient = this.getClientById(targetId)!;
		if (!targetClient) return ;

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

	async onChatMessage(client: Client, payload: { target: string, message: string }) {
		console.log(`target ${payload.target}, message ${payload.message}`)
		if (!this.authorizeContact(client, this.getClientBySocket(payload.target)!, true)) {
			console.error(`Unauthorized chat message from ${client.id} to ${payload.target}`);
			return;
		}
		client.socket.to(payload.target).emit('chat-message', {
			fromId: client.id,
			fromName: client.username,
			message: payload.message,
		});
		// console.log(`payload: ${JSON.stringify(payload)}`);
		const target = this.clients.get(payload.target);
		// console.log(`targetId: ${target?.id}`);
		if (target)
			await this.userDatabase.registerMessage(Number(client.id), Number(target?.id), payload.message);
	}

	authorizeContact(client: Client, target: Client, message?: boolean): boolean {
		if (!client || !target || client.id == target.id ||
			target.blockedList.includes(client.id) ||
			client.blockedList.includes(target.id)
		) {
			if (message)
				this.serverChat(client.socket.id, { error: `Cant Interact with user: ${target?.username}` })
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

	public onCreateTournament(client: Client, { name, displayName, numberOfPlayers }: ITournamentCreation, callback: Function) {
		if (!displayName || typeof displayName !== 'string' || displayName.trim() === "" || !/^[A-Za-z0-9_]+$/.test(displayName))
			return (callback({ ok: false, message: "Invalid display name, only letter, underscore, and digits are allowed" }));
		if (!name || typeof name !== 'string' || name.trim() === "" || !/^[A-Za-z0-9_ ]+$/.test(name))
			return (callback({ ok: false, message: "Invalid tournament name only letters and digits are allowed" }));
		if (numberOfPlayers && (typeof numberOfPlayers !== 'number' || (numberOfPlayers != 4 && numberOfPlayers != 8 &&  numberOfPlayers != 16)))
			return (callback({ ok: false, message: "Invalid number of players" }));
		const res = this.matchmaker.createTournament(client, name, displayName, numberOfPlayers);
		if (res)
			callback({ ok: true, message: res });
		else
			callback({ ok: false, message: "Could not Create Tournament." });
	}

    public onTournamentJoin(client: Client, { displayName, tournamentId }: { displayName: string, tournamentId: string }, callback: Function) {
		// To be checked with Rubens
		if (!displayName || typeof displayName !== 'string' || displayName.trim() === "" || !/^[A-Za-z0-9_]+$/.test(displayName))
			return (callback({ ok: false, message: "Invalid display name, only letter, underscore, and digits are allowed" }));
		const res = this.matchmaker.joinTournament(client, displayName, tournamentId);
		callback({ ok: res === "ok", message: res });
	}

	public onTournamentUnsubscribe(client: Client, { tournamentId }: { tournamentId: string }, callback: Function) {
		const res = this.matchmaker.unsubscribeTournament(client, tournamentId);
		callback({ ok: res === "ok", message: res });
	}
	
	public onTournamentCancel(client: Client, { tournamentId }: { tournamentId: string }, callback: Function) {
		const res = this.matchmaker.cancelTournament(client, tournamentId);
		callback({ ok: res === "ok", message: res });
	}
    
	public async onGetTournament(client: Client, { tournamentId }: { tournamentId: string }, callback: Function) {
		const res = await this.matchmaker.getTournament(tournamentId);
		if (res)
			callback({ ok: true, message: res });
		else
			callback({ ok: false, message: null });
	}

	public async onGetAllTournaments(client: Client, { pageNum, pageSizeNum }: {pageNum: string, pageSizeNum: string}, callback: Function) {
		if (!isIntegerString(pageNum) || !isIntegerString(pageSizeNum)) {
			// return a custom message telling that the parameters are wrong
		}
		const res = await this.matchmaker.getAllTournaments(Number(pageNum), Number(pageSizeNum));
		callback({ ok: res ? true : false, message: res });
	}

	serverChat(target: string, payload: any) {
		this.io.to(target).emit("chat-message", {
			fromId: "system",
			fromName: "server",
			message: payload
		})
	}

	public async onGetChatHistory(client: Client, { targetId }: { targetId: string }, callback: Function) {
		const res = await this.userDatabase.getMessages(Number(client.id), Number(targetId));
		callback({ ok: res.status === 200, message: res.status === 200 ? res.reply : "Could not load chat history"});
	}
}

export default SocketManager;
