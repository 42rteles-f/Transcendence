import Pong from "../Games/PongGame/Pong";
import Client from '../../socket/Client';
import {tournamentGameLogger} from "../../logger/logger"

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

	private startRound()																							// Creates and emits new round pong games to players														
	{
		this.initializeRound();
		this.createRoundGames();
	}

	private initializeRound()																						// Inits tournament and advances round
	{
		if (!this.start_date)
		{
			this.start_date = new Date().toISOString();
			this.status = 'active';

		}
		this.currentRound++;
	}

	private createRoundGames()																						// Creates new Pong games for the round
	{
		for (let i = 0; i < this.qualified.length; i += 2) 
		{
			const gameId = `tournament-${this.id}-round${this.currentRound}-game${i/2}`;
			const game = this.createGame(this.qualified[i], this.qualified[i + 1], gameId);
			this.games.push(game);
			this.emitGameStartEvents(game, gameId);
		}
	}

	private createGame(player1: ITournamentPlayer, player2: ITournamentPlayer, gameId: string): ITournamentGame		// Creates Game with qualified players
	{
		const game: ITournamentGame =
		{
			player1,
			player2,
			pong: new Pong([player1.client.socket, player2.client.socket], gameId),
			round: this.currentRound
		};
		tournamentGameLogger.log(`Created Round ${this.currentRound} game with players ${player1.client.username} (${player1.client.id}) vs ${player2.client.username} (${player2.client.id})`);
		return game;
	}

	private emitGameStartEvents(game: ITournamentGame, gameId: string)												// Emits game to qualified players
	{
		const gameStartData = { tournamentId: this.id, round: this.currentRound, gameId: gameId };
		game.player1.client.socket.emit("tournament-game-start", { ...gameStartData, playerId: game.player1.client.id });
		game.player2.client.socket.emit("tournament-game-start", { ...gameStartData, playerId: game.player2.client.id });
	}


	public gamesCheck() {																							// Checks games state, creates and initializes new rounds and calls when tournament is finished
		const currentRoundGames = this.checkRoundCompletion();
		if (!currentRoundGames)
			return;
		this.processRoundResults(currentRoundGames);
		this.handleTournamentProgression();
	}

	private checkRoundCompletion(): ITournamentGame[] | null														// Check if all games in the round are finished
	{
		const currentRoundGames = this.games.filter(game => game.round === this.currentRound);
		if (currentRoundGames.some(game => game.pong.winner === null))
			return null;
		tournamentGameLogger.log(`Tournament ${this.id}: Round ${this.currentRound} complete - processing winners`);
		return currentRoundGames;
	}

	private processRoundResults(currentRoundGames: ITournamentGame[])												// Processes games results aftrer all rounds are finished
	{
		const roundWinners: ITournamentPlayer[] = [];
		for (let i = 0; i < currentRoundGames.length; i++) {
			const game = currentRoundGames[i];
			if (game.pong.winner) {
				const winnerPlayer = [game.player1, game.player2].find(player => player.client.id === game.pong.winner!.id);
				const loserPlayer = [game.player1, game.player2].find(player => player.client.id !== game.pong.winner!.id);
				if (winnerPlayer)
					roundWinners.push(winnerPlayer);
				if (loserPlayer)
				{
					loserPlayer.client.socket.emit("tournament-eliminated", {tournamentId: this.id});
					this.unsubscribeTournament(loserPlayer.client);
				}
			}
		}
		this.qualified = roundWinners;
	}

	private handleTournamentProgression()																			// Starts new round or finishes tournament
	{
		tournamentGameLogger.log(`Round ${this.currentRound} winners: ${this.qualified.map(p => p.displayName).join(', ')}`);
		if (this.qualified.length > 1)
			this.startRound();
		else if (this.qualified.length === 1)
		{
			tournamentGameLogger.log(`Tournament winner: ${this.qualified[0].displayName}`);
			this.winner = this.qualified[0];
			this.unsubscribeTournament(this.winner.client);
			this.endTournament();
		}
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
		console.log("Player unsubscribed!");
		this.players = this.players.filter(p => p.client.id !== client.id);
		this.qualified = this.qualified.filter(p => p.client.id !== client.id);
	}

	private endTournament() {
		if (this.watcher) {
			clearInterval(this.watcher);
			this.watcher = null;
		}

		this.winner?.client.socket.emit("tournament-completed", { tournamentId: this.id, result: "winner" });
		this.end_date = new Date().toISOString();
		this.status = "finished";
		tournamentGameLogger.log(`Tournament ${this.id} finished. Winner: ${this.winner?.displayName}, End date: ${this.end_date}`);
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
				id: null,
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
