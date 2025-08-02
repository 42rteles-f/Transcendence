import { Socket } from 'socket.io';
import Pong from "../Games/PongGame/Pong";

export class Tournament {
	public games: Pong[] = [];
	private players: Socket[] = [];
	private currentRound: number = 0;
	private watcher: NodeJS.Timeout | null = null;

	constructor(clients: Socket[]) {
		this.players = clients.sort(() => Math.random() - 0.5);
		this.startRound();
		this.startWatch();
	}

	private startRound() {
		this.games = [];
		this.currentRound++;
		for (let i = 0; i < this.players.length; i += 2) {
			const game = new Pong([this.players[i], this.players[i + 1]]);
			this.games.push(game);
		}
	}
	
	public gamesCheck() {
		if (this.games.some(game => game.winner === null)) {
			return ;
		}
	
		this.players = this.players.filter(player => !this.games.some(game => game.winner!.id === player.id));

		if (this.players.length > 1)
			this.startRound();
		else
			this.endTournament();
	}

	public startWatch() {
		this.watcher = setInterval(() => {
			this.gamesCheck();
		}
		, 1000);
	}

	private endTournament() {
		if (this.watcher) {
			clearInterval(this.watcher);
			this.watcher = null;
		}
		// const winner = this.players[0];
		// if (winner)
		// 	winner.emit('tournament-end', { winner: winner.data.user.username });
	}

	private registerGame(game: Pong) {
		// call db
	}
}
