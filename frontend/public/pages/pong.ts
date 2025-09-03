import { BaseComponent } from "../../src/BaseComponent";
import Socket from "../../src/Socket";
import { routes } from '../../src/routes';
import { PongRenderer3D } from "./babylonJS/render3Dpong";
import { AppControl } from "../../src/AppControl";

console.log("executing PongGame");

interface Position {
	x: number;
	y: number;
}

interface PongPlayerState {
	id: string;
	name: string;
	paddle: Position;
	paddleDimensions: {
		width: number;
		height: number;
	};
	score: number;
}

interface PongState {
	playersState: PongPlayerState[];
	ball: Position;
	ballSize: number;
	gameStatus: string;
}

// Why does file pong.ts has class PongGame?, there there is Pong.ts with Pong class ~ ~ ~
class PongGame extends BaseComponent {
	private canvas!: HTMLCanvasElement;
	private	localPlay: boolean = false;
	private tournamentPlay: boolean = false;
	private renderer3D!: PongRenderer3D;

	private player1Name!: HTMLElement;
	private player1Score!: HTMLElement;
	private player2Name!: HTMLElement;
	private player2Score!: HTMLElement;

	constructor(args: string) {
		super("/pages/pong.html");
		this.localPlay = args === "local-play";
		this.tournamentPlay = args === "tournament";

		if (this.tournamentPlay)
			this.isUserPlayingTournament()
			
	}

	isUserPlayingTournament() {
		const gameInfo = sessionStorage.getItem('tournamentGame');					// Event sored in the fronten | Socket -> No persistence: If user refreshes /pong/tournament page, the socket event is lost (not sure If I can refresh my games also)
		if (!gameInfo)
		{
			console.log("No tournament game found in session");
			setTimeout(() => { routes.navigate("/tournaments"); }, 0);
			return false;  
		}
		return true; 
	}

	onInit() {
		this.setupCanvas();
		this.setupSocket();
		this.setControlKeys("w", "s", "paddle-update");
		if (this.localPlay) {
			this.setControlKeys("ArrowUp", "ArrowDown", "second-paddle-update");
			Socket.emit("pong-local-play");
		}
		else if (this.tournamentPlay)
			console.log("Tournament mode"); // Log to frontend only
		else
			Socket.emit("pong-match-find");
		this.canvas.tabIndex = 0;
		this.canvas.focus();
		this.canvas.style.outline = "none";
	}

	private setupCanvas() {
		//if (!this.canvas.id)
		this.canvas.id = "pongCanvas";
		const canvasWidth = this.canvas.width || 800;
		const canvasHeight = this.canvas.height || 600;
		this.renderer3D = new PongRenderer3D(this.canvas.id, canvasWidth, canvasHeight);
	}

	setControlKeys(upKey: string, downKey: string, emitName: string) {
		this.canvas.addEventListener("keydown", (event: KeyboardEvent) => {
			if (event.key === upKey || event.key === downKey) {
				event.preventDefault();
				event.stopPropagation();
				Socket.emit(emitName, { direction: (event.key === upKey) ? -1 : 1 });
			}
		});
		this.canvas.addEventListener("keyup", (event: KeyboardEvent) => {
			if (event.key === upKey || event.key === downKey) {
				event.preventDefault();
				event.stopPropagation();
				Socket.emit(emitName, { direction: 0 });
			}
		});
	}

	getUserId()
	{
		const token = AppControl.getValidDecodedToken() as { id: number | string };
		return token?.id;
	}

	private setupSocket()
	{
		Socket.init();
		this.setupGameStateListener();
		if (this.tournamentPlay)
			this.setupTournamentListeners();
	}

	private setupGameStateListener() {												// Game state listener
		Socket.addEventListener("pong-state", (state: PongState) => { this.drawGame(state); });
	}

	private setupTournamentListeners() {											// Recive tournament end, player elimination, game start
		Socket.addEventListener("tournament-completed", (data: any) => { routes.navigate(`/tournament/${data.tournamentId}`); }); // console.log("Tournament completed! You are the winner!");
		Socket.addEventListener("tournament-eliminated", (data: any) => { routes.navigate(`/tournament/${data.tournamentId}`); });	// console.log("You have been eliminated from the tournament");
		Socket.addEventListener("tournament-game-start", (data: any) => { this.handleTournamentGameStart(data); });
	}

	private handleTournamentGameStart(data: any) {									// Recive tournament game start, save item to localstorage, redirect user
		const myUserId = this.getUserId();
		console.log(`My userId: ${myUserId}, Event playerId: ${data.playerId}`);
		
		if (Number(data.playerId) === Number(myUserId))
		{
			sessionStorage.setItem('tournamentGame', JSON.stringify({ gameId: data.gameId, tournamentId: data.tournamentId }));
			routes.navigate(`/pong/tournament`);
		}
	}

	private drawGame(state: PongState) {
		//console.log("Drawing Pong Game in 3D", state);
		// eFfIciENcY 1oo%
		if (state.playersState && state.playersState.length >= 2)
		{
			this.player1Name.textContent = state.playersState[0].name || "Player 1";
			this.player1Score.textContent = state.playersState[0].score.toString();
			this.player2Name.textContent = state.playersState[1].name || "Player 2";
			this.player2Score.textContent = state.playersState[1].score.toString();
		}
		this.renderer3D.drawGame(state);
	}

	onDestroy()
	{
		if (!this.tournamentPlay)
			Socket.emit("pong-match-leave");

		if (this.renderer3D)
			this.renderer3D.dispose();

		// TODO: Fix event listener cleanup ~~~ Browser automatically cleans up when components are removed
		// Socket.removeEventListener("tournament-eliminated", callback);
		// Socket.removeEventListener("tournament-game-start", callback);
	}
}

customElements.define("pong-game", PongGame);

export { PongGame };
