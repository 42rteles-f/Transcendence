import Pong from '../services/Games/PongGame/Pong';
import Client from './Client';
import { Server } from "socket.io";


const INTERVAL_MATCHMAKING = 3000;

interface IInvite {
	guest: Client;
	room: string;
	status: 'pending' | 'accepted';
}

class Matchmaker {
	private	queue:		Client[] = [];
	private	invites:	Map<Client, IInvite> = new Map();
	private games:		Array<{id: string, game: Pong}> = new Array();
	private watcher:	NodeJS.Timeout | null = null;
	private server: Server;

	public constructor(server: Server) {
		this.server = server;
		this.startMatchmaking();
	}

	public createInvite(host: Client, guest: Client): void {
		const invite = this.invites.get(host);
		if (invite) this.removeInvite(host, invite);

		const newInvite: IInvite = {
			guest,
			room: `invite-${host.id}-${guest.id}-${new Date().toISOString().replace(/[-:.TZ]/g, "")}`,
			status: 'pending',
		}
		this.invites.set(host, newInvite);

		host.socket.join(newInvite!.room);
		guest.socket.join(newInvite!.room);
		this.server.to(newInvite!.room).emit('invite-created', {
			from: host.id,
			to: guest.id,
			room: newInvite!.room,
		});
	}

	public joinInvite(host: Client, guest: Client): void {
		const invite = this.invites.get(host);
		if (invite && invite.guest.id !== guest.id) {
			guest.socket.emit('invite-error', { message: 'Invite expired.' });
			return;
		}
		invite!.status = 'accepted';
	}

	public removeInvite(host: Client, invite: IInvite): void {
		const guest = invite.guest;
		this.server.to(invite.room).emit(
			'invite-cancelled',
			{ message: 'Invite Cancelled.', host: host.id, guest: guest.id }
		);
		host.socket.leave(invite!.room);
		guest.socket.leave(invite!.room);
		this.invites.delete(host);
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
			this.watchGames();
			while (this.queue.length >= 2) {
				const players = this.queue.splice(0, 2).map(c => c.socket);
				this.games.push({ id: "Teste", game: new Pong(players) });
			}
			this.invites.forEach((invite, host) => {
				const guest = invite.guest;
				if (invite.status === 'accepted') {
					this.games.push({ id: invite.room, game: new Pong([host.socket, guest.socket]) });
					this.server.to(invite!.room).emit('start-game-invite', { room: invite!.room });
				}
			});
		}, INTERVAL_MATCHMAKING);
	}

	public stopMatchmaking(): void {
		clearInterval(this.watcher!);
		this.watcher = null;
		this.games.forEach(game => game.game.destructor());
		this.games = [];
		this.queue = [];
	}

	private watchGames(): void {
		this.games = this.games.filter(game => {
			const { gameStatus } = game.game.getState();
			if (gameStatus === 'finished' || gameStatus === 'error') {
				game.game.destructor();
				return false;
			}
			return true;
		});
	}
}

export default Matchmaker;
