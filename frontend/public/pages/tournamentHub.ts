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

    constructor(tournamentId: string | null) {
        super("/pages/tournamentHub.html");
        this.tournamentId = tournamentId;
    }

    async onInit() {
        if (!this.tournamentId) {
            routes.navigate("/404");
            return;
        }

        await this.loadTournament();
		this.tournamentMenu.addEventListener('click', () => {
			this.appendChild(new TournamentMenu(this.tournament));
		})
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