import { BaseComponent } from "../../src/BaseComponent";
import { routes } from '../../src/routes';
import Api from '../../src/api/Api';

type Player = {
    id: number;
    username: string | null;
    displayName: string;
};

type Game = {
    id: number;
    player1: Player | null;
    player2: Player | null;
    score1: number | null;
    score2: number | null;
    winnerId: number | null;
	winnerName?: string | null;
};

type Tournament = {
    id: number;
    name: string;
    participants: Player[];
    games: Game[];
    maxPlayers: number;
	winnerId?: number | null;
    winnerName?: string | null;
    status?: string;
};

class TournamentDashboardPage extends BaseComponent {
    private tournamentName!: HTMLElement;
    private bracketContainer!: HTMLElement;
    private rankingList!: HTMLElement;
    private tournamentId!: number;
    private tournament!: Tournament;

    constructor(tournamentId: number) {
        super("/pages/tournamentDashboard.html");
        this.tournamentId = tournamentId;
    }

    async onInit() {
        if (!this.tournamentId) {
            routes.navigate("/404");
            return;
        }
        await this.loadTournament();
    }

    async loadTournament() {
        try {
            const res = await Api.getTournament(this.tournamentId);
            this.tournament = res.message ?? res;

            this.tournamentName.textContent = this.tournament.name;
            this.renderBracket();
            this.renderRanking();
        } catch (e) {
			routes.navigate("/404");
        }
    }

    renderBracket() {
		const games = this.tournament.games;
		const totalPlayers = this.tournament.participants.length;
		const rounds: { [round: number]: Game[] } = {};

		let gamesInRound = Math.ceil(totalPlayers / 2);
		let round = 1;
		let idx = 0;

		while (idx < games.length) {
			rounds[round] = [];
			for (let i = 0; i < gamesInRound && idx < games.length; i++, idx++) {
				rounds[round].push(games[idx]);
			}
			gamesInRound = Math.ceil(gamesInRound / 2);
			round++;
		}

		const roundNumbers = Object.keys(rounds).map(Number).sort((a, b) => a - b);

		this.bracketContainer.innerHTML = "";
		for (const round of roundNumbers) {
			const roundCol = document.createElement("div");
			roundCol.className = "flex flex-col gap-6 min-w-[220px]";
			const roundTitle = document.createElement("div");
			roundTitle.className = "text-center font-bold mb-2";
			roundTitle.textContent = `Round ${round}`;
			roundCol.appendChild(roundTitle);

			for (const game of rounds[round]) {
				const card = document.createElement("div");
				card.className = "bg-gray-100 rounded-xl shadow-md px-4 py-3 flex flex-col items-center cursor-pointer hover:bg-blue-100 transition border-2 " +
					(game.winnerId ? "border-green-400" : "border-gray-200");
				card.addEventListener("click", () => {
					routes.navigate(`/game/${game.id}`);
				});

				card.innerHTML = `
				<div class="font-semibold text-gray-700 mb-1">
					${game.player1 ? `${game.player1.displayName} (${game.player1.username || "no user"})` : "BYE"}
					<span class="mx-1 text-gray-400">vs</span>
					${game.player2 ? `${game.player2.displayName} (${game.player2.username || "no user"})` : "BYE"}
				</div>
				<div class="text-sm mb-1">
					<span class="font-semibold">Score:</span>
					${game.score1 !== null && game.score2 !== null ? `${game.score1} - ${game.score2}` : "-"}
				</div>
				<div class="text-xs">
					<span class="font-semibold">Winner:</span>
					${game.winnerId
						? [game.player1, game.player2].find(p => p && p.id === game.winnerId)?.username || "-"
						: "-"}
				</div>
				`;
				roundCol.appendChild(card);
			}
			this.bracketContainer.appendChild(roundCol);
		}
	}

    renderRanking() {
        const winCount: { [id: number]: number } = {};
        for (const game of this.tournament.games) {
            if (game.winnerId) {
                winCount[game.winnerId] = (winCount[game.winnerId] || 0) + 1;
            }
        }
        const ranked = [...this.tournament.participants].sort((a, b) => (winCount[b.id] || 0) - (winCount[a.id] || 0));
        this.rankingList.innerHTML = "";
        ranked.forEach((p, i) => {
            const li = document.createElement("li");
            li.textContent = `${p.displayName} (${p.username}) [${winCount[p.id] || 0} win${(winCount[p.id] || 0) === 1 ? "s" : ""}]`;
            this.rankingList.appendChild(li);
        });
    }
}

customElements.define("tournament-dashboard-page", TournamentDashboardPage);
export { TournamentDashboardPage };