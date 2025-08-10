import { Socket } from 'dgram';
import Pong from '../services/Games/PongGame/Pong';
import Client from './Client';
import { Server } from "socket.io";
import SocketManager from './SocketManager';


const INTERVAL_MATCHMAKING = 3000;

interface IInvite {
	guest: Client;
	room: string;
	status: 'pending' | 'accepted' | 'started';
}

class Matchmaker {
	private	queue:		Client[] = [];
	private	invites:	Map<Client, IInvite> = new Map();
	private games:		Array<{id: string, pong: Pong}> = new Array();
	private watcher:	NodeJS.Timeout | null = null;
	private server:		SocketManager;

	public constructor(server: SocketManager) {
		this.server = server;
		this.startMatchmaking();
	}

	public createInvite(host: Client, guest: Client): void {
		const invite = this.invites.get(host);
		if (invite) this.removeInvite(host);

		const newInvite: IInvite = {
			guest,
			room: this.createGameId('invite', [host, guest]),
			status: 'pending',
		}
		this.invites.set(host, newInvite);

		host.socket.join(newInvite!.room);
		guest.socket.join(newInvite!.room);

		this.server.serverChat(newInvite!.room, {
			invite: host.id,
			guest: guest.id,
			message: `${host.username} invited ${guest.username}`
		});
	}

	public joinInvite(host: Client, guest: Client): void {
		const invite = this.invites.get(host);
		if (!invite || (invite && invite.guest.id !== guest.id)) {
			this.server.serverChat(guest.socket.id, { error: `Invite ${host.username}-${guest.username} expired` })
			console.log(`${invite?.guest.id} !== ${guest.id}`)
			return;
		}
		invite!.status = 'accepted';
	}

	public removeInvite(host: Client): void {
		const invite = this.invites.get(host);
		if (!invite) return ;

		const guest = invite.guest;
		this.server.serverChat(invite.room, { error: `Invite ${host.username}-${guest.username} expired` })
		host.socket.leave(invite!.room);
		guest.socket.leave(invite!.room);
		this.invites.delete(host);
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
			this.games.push({ id: this.createGameId("pong", players), pong: new Pong(players.map(c => c.socket)) });
		}
	}

	private startInviteGames(): void {
		this.invites.forEach((invite, host) => {
			if (invite.status === 'accepted') {
				this.games.push({ id: invite.room, pong: new Pong([host.socket, invite.guest.socket]) });
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
}

export default Matchmaker;
