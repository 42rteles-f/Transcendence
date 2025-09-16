import TournamentDatabase from '../database/tournament';
import Pong from '../services/Games/PongGame/Pong';
import { Tournament } from '../services/Tournament/Tournament';
import Client from './Client';
import SocketManager from './SocketManager';
import { randomUUID } from 'node:crypto';
import { dbLite } from '..';

const INTERVAL_MATCHMAKING = 3000;

interface ClientRef {
	id: string;
	info: Client;
}

interface IInvite {
	guest: ClientRef;
	room: string;
	status: 'pending' | 'accepted' | 'started';
}

class Matchmaker {
	private	queue:			Client[] = [];
	private	invites:		Map<ClientRef, IInvite> = new Map();
	private games:			Array<{id: string, pong: Pong}> = new Array();
	private watcher:		NodeJS.Timeout | null = null;
	private server:			SocketManager;
	private tournaments:	Tournament[] = [];
	private db:				TournamentDatabase;

	public constructor(server: SocketManager) {
		this.server = server;
		this.db = new TournamentDatabase(dbLite);
		this.startMatchmaking();
	}

	private findInviteById(id: string): IInvite | undefined {
		for (const [clientRef, invite] of this.invites) {
			if (clientRef.id === id) {
			return invite;
			}
		}
		return (undefined);
	}

	removeInviteById(id: string): boolean {
		for (const clientRef of this.invites.keys()) {
			if (clientRef.id === id) {
				return this.invites.delete(clientRef);
			}
		}
		return (false);
	}

	public createInvite(host: Client, guest: Client): void {
		const invite = this.findInviteById(host.id);
		if (invite) this.removeInvite(host);

		const newInvite: IInvite = {
			guest: { id: guest.id, info: guest },
			room: this.createGameId('invite', [host, guest]),
			status: 'pending',
		}
		this.invites.set({ id: host.id, info: host }, newInvite);

		host.socket.join(newInvite!.room);
		guest.socket.join(newInvite!.room);

		this.server.serverChat(newInvite!.room, {
			invite: host.id,
			guest: guest.id,
			message: `${host.username} invited ${guest.username}`
		});
	}

	public joinInvite(host: Client, guest: Client): void {
		const invite = this.findInviteById(host.id);
		if (!invite || (invite && invite.guest.id !== guest.id)) {
			this.server.serverChat(guest.socket.id, { error: `Invite ${host.username}-${guest.username} expired` })
			console.log(`joinInvite ${invite?.guest.id} !== ${guest.id}`)
			return;
		}
		invite!.status = 'accepted';
	}

	public removeInvite(host: Client): void {
		const invite = this.findInviteById(host.id);
		console.log(`invite being removed ${invite?.guest}`)
		if (!invite) return ;

		const guest = invite.guest.info;
		this.server.serverChat(host.socket.id, { error: `Invite ${host.username}-${guest.username} expired` })
		host.socket.leave(invite!.room);
		guest.socket.leave(invite!.room);
		this.removeInviteById(host.id);
	}

	createGameId(prefix:string, players: Client[]): string {
		return `${prefix}-${players[0].id}-${players[1].id}-${new Date().toISOString().replace(/[-:.TZ]/g, "")}`;
	}

	public	addToQueue(client: Client): void {
		if (!this.queue.some(c => c.socket.id === client.socket.id)) {
			this.queue.push(client);
		}
	}

	public	removeFromQueue(client: Client): void {
		this.queue = this.queue.filter(c => c.socket.id !== client.socket.id);
	}

	public startMatchmaking(): void {
		this.watcher = setInterval(() => {
			this.checkGames();
			this.startQueueGames();
			this.startInviteGames();
		}, INTERVAL_MATCHMAKING);
	}

	public stopMatchmaking(): void {
		clearInterval(this.watcher!);
		this.watcher = null;
		this.games.forEach(game => game.pong.destructor());
		this.games = [];
		this.queue = [];
		this.invites.clear();
	}

	private startQueueGames(): void {
		while (this.queue.length >= 2) {
			const players = this.queue.splice(0, 2);
			const pongGame = new Pong(players.map(c => c.socket));
			pongGame.onPlayerJoin(players[0].socket);
			pongGame.onPlayerJoin(players[1].socket);
			this.games.push({ id: this.createGameId("pong", players), pong: pongGame });
		}
	}

	private startInviteGames(): void {
		this.invites.forEach((invite, host) => {
			if (invite.status === 'accepted') {
				this.games.push({ id: invite.room, pong: new Pong([host.info.socket, invite.guest.info.socket]) });
				this.server.serverChat(invite!.room, {
					room: invite!.room
				});
				this.invites.delete(host);
			}
		});
	}

	private checkGames(): void {
		this.games = this.games.filter(game => {
			const { gameStatus } = game.pong.getState();
			if (gameStatus === 'finished' || gameStatus === 'error') {
				game.pong.destructor();
				return false;
			}
			return true;
		});
	}

	public createTournament(client: Client, name: string, displayName: string, numberOfPlayers: number) {
		if (this.tournaments.some((t) => t.owner.client.id == client.id))
			return (undefined);
		const id = `${client.id}-${randomUUID()}`;
		this.tournaments.push(new Tournament(client, name, displayName, numberOfPlayers, id));
		return (id);
	}

	public joinTournament(client: Client, displayName: string, tournamentId: string) {
		// TODO: To be checked with Rubens

		const targetTournament = this.tournaments.filter((t) => t.id == tournamentId)[0];
		if (!targetTournament)
			return ("Tournament not found");
		if (this.tournaments.some((t) => t.players.some((p) => p.client.id === client.id)))
			return ("Already subscribed to another tournament");
		if (targetTournament.players.some(p => p.displayName === displayName))
			return ("Display name already taken");
		if (targetTournament.players.length === targetTournament.numberOfPlayers)
			return ("Tournament already full");
		if (targetTournament.start_date)
			return ("Tournament already started or finished");
		targetTournament.joinTournament(client, displayName);
		return ("ok");
	}

	public leaveTournament(client: Client, tournamentId: string) {
		const targetTournament = this.tournaments.filter(t => t.id === tournamentId)[0];
		if (!targetTournament)
			return ("Tournament not found");
		if (!(targetTournament.players.filter(p => p.client.id === client.id)[0]))
			return ("Not subscribed to this tournament");
		if (targetTournament.start_date)
			return ("Tournament already started or finished");
		targetTournament.unsubscribeTournament(client);
		return ("ok");
	}

	public cancelTournament(client: Client, tournamentId: string) {
		const targetTournament = this.tournaments.filter(t => t.id === tournamentId)[0];
		if (!targetTournament)
			return ("Tournament not found");
		if (!(targetTournament.players.filter(p => p.client.id === client.id)[0]))
			return ("Not subscribed to this tournament");
		if (targetTournament.owner.client.id !== client.id)
			return ("Only the tournament owner can cancel it")
		if (targetTournament.start_date)
			return ("Tournament already started or finished");
		this.tournaments = this.tournaments.filter(t => t.id !== tournamentId);
		return ("ok");
		// Emit an event to all listening sockets
	}

	public async getTournament(tournamentId: string) {
		const targetTournament = this.tournaments.filter((t) => t.id === tournamentId)[0];
		if (targetTournament)
			return (targetTournament.tournamentInfos());
		const res = await this.db.getTournament(tournamentId);
		if (res.status != 200)
			return (false);
		return (res.reply);
	}

	public async getAllTournaments(pageNum: number, pageSizeNum: number) {
		const offset = (pageNum - 1) * pageSizeNum;
		let tournaments = this.tournaments
		.map(t => {
			const obj = t.tournamentInfos();
			return (
				{
					id: obj.id,
					uuid: obj.uuid,
					name: obj.name,
					startDate: obj.startDate,
					winnerId: obj.winnerId,
					ownerId: obj.ownerId,
					ownerName: obj.ownerName,
					numberOfPlayers: obj.numberOfPlayers,
					status: obj.status,
					winnerName: obj.winnerName
				}
			);
		});
		const { status, reply }  = await this.db.getAllTournaments();
		if (status !== 200) {
			// Should we send an error message or similar?
		}
		reply.tournaments.forEach((t: any) => tournaments.push(t));
		const total = tournaments.length;
		tournaments = tournaments.slice(offset, pageSizeNum);
		return ({ tournaments, total });
	}

	clientReconnect(client: Client) {
		this.invites.forEach((invite, clientRef) => {
			let update;
			if (clientRef.id === client.id) {
				clientRef.info = client;
				update = true;
			}
			else if (invite.guest.id === client.id) {
				invite.guest.info = client;
				update = true;
			}
			if (update)
				client.socket.join(invite.room);
		});
		this.games.forEach(game => {
			game.pong.onPlayerJoin(client.socket);
		});
		// this.tournaments.forEach(t => {
		// 	if (t.owner.client.id === client.id)
		// 		t.owner.client = client;
		// 	t.players.forEach((p, index) => {
		// 		if (p.client.id === client.id)
		// 			t.players[index].client = client;
		// 	});
		// });
	}
}

export default Matchmaker;
