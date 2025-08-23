import Pong from "../Games/PongGame/Pong";
import Client from '../../socket/Client';

interface ITournamentPlayer {
	client:			Client;
	displayName:	string;
};

interface ITournamentGame {
	pong:		Pong;
	player1:	ITournamentPlayer;
	player2:	ITournamentPlayer;
	round:		number;
};

export class Tournament {
	public  games: 				ITournamentGame[] = [];
	public  players:			ITournamentPlayer[] = [];
	private qualified:			ITournamentPlayer[] = [];
	private maxRound:			number;
	private currentRound:		number = 0;
	private watcher:			NodeJS.Timeout | null = null;
	public  id:					string;
	public  name:				string;
	public  start_date:			string | null = null;
	public  winner:				ITournamentPlayer | null = null;
	public  owner:				ITournamentPlayer;
	public  numberOfPlayers:	number;
	public  status:				string;
	public  created_at:			string;
	public  end_date:			string = '';


	constructor(client: Client, name: string, displayName: string, numberOfPlayers: number, id: string) {
		const player = { client, displayName };
		this.players = [player];
		this.qualified = [player];
		this.owner = player;
		this.name = name;
		this.numberOfPlayers = numberOfPlayers;
		this.status = 'waiting';
		this.id = id;
		this.created_at = new Date().toISOString();
		this.maxRound = Math.log2(numberOfPlayers);
	}

	private startRound() {
		this.start_date = new Date().toISOString();
		if (this.maxRound < this.currentRound) {
			return (this.endTournament());
		}
		this.games = [];
		this.currentRound++;
		for (let i = 0; i < this.qualified.length; i += 2) {
			const game: ITournamentGame = {
				player1: this.qualified[i],
				player2: this.qualified[i + 1],
				pong: new Pong([this.qualified[i].client.socket, this.qualified[i + 1].client.socket]),
				round: this.currentRound
			}
			this.games.push(game);
		}
	}
	
	public gamesCheck() {
		if (this.games.some(game => game.pong.winner === null)) {
			return ;
		}
	
		this.qualified = this.qualified.filter(player => !this.games.some(game => game.pong.winner!.id === player.client.id));

		if (this.qualified.length > 1)
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

	public joinTournament(client: Client, displayName: string) {
		if (this.start_date)
			return ;
		this.players.push({ client, displayName });
		this.qualified.push({ client, displayName });
		if (this.players.length == this.numberOfPlayers) {
			this.startRound();
			this.startWatch();
		}
	}

	public unsubscribeTournament(client: Client) {
		this.players = this.players.filter(p => p.client.id !== client.id);
		this.qualified = this.qualified.filter(p => p.client.id !== client.id);
	}

	private endTournament() {
		if (this.watcher) {
			clearInterval(this.watcher);
			this.watcher = null;
			this.end_date = new Date().toISOString();
		}
	}

	private registerGame(game: Pong) {
		// call db
	}

	public tournamentInfos() {
		const participants = this.players.map((p) => {
			return ({
				id: p.client.id,
				username: p.client.username,
				displayName: p.displayName
			});
		});
		const games = this.games.map((g) => {
			return ({
				id: null, /// Check with Rubens
				player1Id: g.player1.client.id,
				player1Username: g.player1.client.username,
				player1DisplayName: g.player1.displayName,
				player1Score: g.pong.getState().playersState[0].score,
				player2Id: g.player2.client.id,
				player2Username: g.player2.client.username,
				player2DisplayName: g.player2.displayName,
				player2Score: g.pong.getState().playersState[1].score,
				status: g.pong.getState().gameStatus,
				winnerId: g.pong.winner ? g.pong.winner.id : null,
				winnerName: g.pong.winner ? g.pong.winner.name : null,
				round: g.round
			});
		});
		return ({
			id: this.id,
			uuid: this.id,
			name: this.name,
			startDate: this.start_date,
			ownerId: this.owner.client.id,
			ownerName: this.owner.client.username,
			numberOfPlayers: this.numberOfPlayers,
			status: this.status,
			winnerId: this.winner ? this.winner.client.id : null,
			winnerName: this.winner ? this.winner.client.username : null,
			participants,
			currentRound: this.currentRound,
			maxRound: this.maxRound,
			games
		});
	}
}
