import { BaseComponent } from "../../src/BaseComponent";
import { AppControl } from "../../src/AppControl";
import { showToast } from "./toastNotification";
import { routes } from '../../src/routes';
import { TournamentGameCell } from '../components/tournamentGameCell';
import { TournamentMenu } from '../components/tournamentMenu';
import Socket from '../../src/Socket';

class TournamentHubPage extends BaseComponent {
	private tournamentId!: 		string | null;
	private tournament: 		any;
	private tournamentMenu!:	HTMLButtonElement;
	private gamesBrackets!: 	HTMLElement;
	private updateHandler:		any;
	private gameStartHandler:	any
	private userId!:			number;

	constructor(tournamentId: string | null) {
		super("/pages/tournamentHub.html");
		this.tournamentId = tournamentId;
	}

	async onInit() {
		const { id } = AppControl.getValidDecodedToken() as { id: number | string };
		this.userId = Number(id);

		if (!this.tournamentId) {
			routes.navigate("/404");
			return;
		}
		
		await this.loadTournament();
		this.subscribeToUpdates();													// Added to recive all the updates from frontend (event listeners)
		this.tournamentMenu.addEventListener('click', () => {
			this.appendChild(new TournamentMenu(this.tournament));
		})
	}

	subscribeToUpdates() {															// Main update handler, takes care of updating tournament view, starting and redirecting players to tournament
		this.updateHandler = (data: any) =>
		{
			//  console.log("Tournament update received:", data);
			if (data.exists === false || data.action === "cancel")
			{
				showToast("Tournament has been cancelled", 3000, "info");
				routes.navigate("/tournaments");
				return;
			}
			this.tournament = data;
			this.refreshDisplay(data.action);
		};

		this.gameStartHandler = (data: any) => {
			if (Number(data.playerId) === Number(this.userId))
			{
				sessionStorage.setItem('tournamentGame', JSON.stringify({
					gameId: data.gameId,
					tournamentId: data.tournamentId
				}));
				routes.navigate(`/pong/${data.gameId}`);
			} else {														// TODO: Remove, not usefull
				console.log("A tournament game started (spectating)");
				showToast("You're spectating XY game", 2000, "info");
			}
		};

		Socket.request("watch-tournament", { tournamentId: this.tournamentId });
		Socket.addEventListener("tournament-updated", this.updateHandler);			// Recives updates from the backend to update page whenever there is a change (like a player join)
		Socket.addEventListener("tournament-game-start", this.gameStartHandler);	// Recives updats for when a tournament has began and sent its first game-start //		(All the players should be preaviusly redirected to /pong/tournament and the event should go only there but wtv)
	}																				

	refreshDisplay(action: string)													// Updates frontend state and informative mesage
	{
		const rounds = this.querySelectorAll('.round');
		rounds.forEach(round => round.remove());
		this.renderBracket();
		const messages: { [key: string]: string } =
		{
			'join': 'A new player joined the tournament!',
			'leave': 'A player left the tournament',
			'update': 'Tournament updated',
			'cancel': 'Tournament cancelled'
		};
		showToast(messages[action] || 'Tournament updated', 2000, "info");
	}

	disconnectedCallback()															// Called onDestroy
	{
		if (this.updateHandler)
		{
			Socket.removeEventListener("tournament-updated", this.updateHandler);
			Socket.request("stop-watching-tournament", { tournamentId: this.tournamentId });
		}
	}

	async loadTournament() {
		try {
			if (!this.tournamentId)
				return;
			const res = await Socket.request("get-tournament", { tournamentId: this.tournamentId });
			if (res.ok !== true) {
				showToast("could not load tournament", 2000, "error");
				routes.navigate("/404");
				return ;
			}
			this.tournament = res.message;

			this.renderBracket();
		} catch (e) {
			console.log("Error loading tournament:", e);
			showToast("Failed to load tournament", 3000, "error");
			routes.navigate("/404");
		}
	}

	renderBracket() {
		let totalGames = Number(this.tournament.numberOfPlayers);
		let gamesPerRound = totalGames / 2; 
		const lenghtOfFirstRow = Number(this.tournament.numberOfPlayers) / 2;
		for (let i = 1; i <= Number(this.tournament.maxRound); i++) {
			const gamesOfRound = this.tournament.games.filter((g: any) => Number(g.round) === i);
			const round = document.createElement("div");
			round.classList.add("round", "w-[45rem]", "max-w-[1000px]", "h-[10rem]", "max-h-[500px]", "round-[0.5rem]", "flex", "justify-center", "items-center", "gap-[0.5rem]");
			for (let j = 0; j < gamesPerRound; j++) {
				const gameCell = new TournamentGameCell(gamesOfRound[j])
				gameCell.style.flex = `0 1 ${lenghtOfFirstRow}%`;
				round.appendChild(gameCell);
			}
			gamesPerRound /= 2;
			this.gamesBrackets.insertAdjacentElement('afterend', round);
		}
	}
}

customElements.define("tournament-hub-page", TournamentHubPage);
export { TournamentHubPage };