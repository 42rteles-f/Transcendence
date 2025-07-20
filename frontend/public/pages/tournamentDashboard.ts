import { BaseComponent } from "../../src/BaseComponent";
import { AppControl } from "../../src/AppControl";
import { routes } from '../../src/routes';

type Player = { id: number, username: string };
type Game = {
    id: number;
    round: number;
    player1: Player | null;
    player2: Player | null;
    score1: number | null;
    score2: number | null;
    winnerId: number | null;
};
type Tournament = {
    id: number;
    name: string;
    status: string;
    winnerName?: string;
    winnerId?: number;
    participants: Player[];
    games: Game[];
    maxPlayers: number;
};

class TournamentBracketPage extends BaseComponent {
    private tournamentName!: HTMLElement;
    private status!: HTMLElement;
    private playersCount!: HTMLElement;
    private winner!: HTMLElement;
    private bracketContainer!: HTMLElement;
    private tournamentId!: number;
    private tournament!: Tournament;

    constructor(tournamentId: number) {
        super("/pages/tournamentBracket.html");
        this.tournamentId = tournamentId;
    }

    async onInit() {
        this.tournamentName = this.querySelector('[data-ref="tournamentName"]')!;
        this.status = this.querySelector('[data-ref="status"]')!;
        this.playersCount = this.querySelector('[data-ref="playersCount"]')!;
        this.winner = this.querySelector('[data-ref="winner"]')!;
        this.bracketContainer = this.querySelector('[data-ref="bracketContainer"]')!;

        await this.loadTournament();
    }

    async loadTournament() {
        try {
            const res = await AppControl.getTournament(this.tournamentId);
            this.tournament = res.message ?? res;

            this.tournamentName.textContent = this.tournament.name;
            this.status.textContent = this.tournament.status;
            this.playersCount.textContent = `${this.tournament.participants.length}/${this.tournament.maxPlayers}`;
            this.winner.textContent = this.tournament.winnerName || "-";

            this.renderBracket();
        } catch (e) {
            this.tournamentName.textContent = "Failed to load tournament";
        }
    }

    renderBracket() {
        const rounds: { [round: number]: Game[] } = {};
        for (const game of this.tournament.games) {
            if (!rounds[game.round]) rounds[game.round] = [];
            rounds[game.round].push(game);
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
                    ${game.player1 ? game.player1.username : "BYE"}
                    <span class="mx-1 text-gray-400">vs</span>
                    ${game.player2 ? game.player2.username : "BYE"}
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
}

customElements.define("tournament-bracket-page", TournamentBracketPage);
export { TournamentBracketPage };