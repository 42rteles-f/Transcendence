import Pong from '../services/Games/PongGame/Pong';
import Client from './Client';

const INTERVAL_MATCHMAKING = 5000;

class Matchmaker {
	private	queue: Client[] = [];
	private games: Array<{id: string, game: Pong}> = new Array();
	private watcher: NodeJS.Timeout | null = null;

	public constructor() {
		this.startMatchmaking();
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
				const game = new Pong(players);
				this.games.push({ id: "Teste", game });
			}
		}, INTERVAL_MATCHMAKING);
	}

	public stopMatchmaking(): void {
		clearInterval(this.watcher!);
		this.watcher = null;
		this.games.forEach(game => game.game.destructor());
		this.games = [];
		this.queue = [];
	}

	private	watchGames(): void {
		this.games.forEach((game, index) => {
			const { gameStatus } = game.game.getState();
			if (gameStatus === 'finished' || gameStatus === 'error') {
				game.game.destructor();
				this.games.splice(index, 1);
			}
		});
	}

}

export default Matchmaker;
