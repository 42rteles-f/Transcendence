import { AppControl } from '../../src/AppControl';
import { BaseComponent } from "../../src/BaseComponent";
import { showToast } from './toastNotification';

class MatchHistoryModal extends BaseComponent {
    private closeModalButton!: HTMLButtonElement;
    private historyList!: HTMLDivElement;
	private totalGames!: HTMLSpanElement;
    private paginationPrev!: HTMLButtonElement;
    private paginationNext!: HTMLButtonElement;
    private page = 1;
    private pageSize = 5;
    private userId: number;

    constructor(userId: number) {
        super("/pages/matchHistoryModal.html");
		this.tabIndex = -1;
        this.userId = userId;
    }

    async onInit() {
		this.focus();
		this.addEventListener("keydown", this.handleEsc);
        this.closeModalButton.onclick = () => this.close();
        this.paginationPrev.onclick = () => this.changePage(-1);
        this.paginationNext.onclick = () => this.changePage(1);
        await this.loadHistory();
    }

    async loadHistory() {
        try {
            const matches = await AppControl.getMatchHistory(this.userId, this.page, this.pageSize);
            this.renderHistory(matches.games, matches.total);
        } catch (error) {
            showToast("Failed to load match history matchHistoryModal", 3000, "error");
        }
    }

    renderHistory(games: any[], total: number) {
        this.historyList.innerHTML = "";
		this.totalGames.textContent = `Total Matches: ${total}`;
        if (!games.length) {
            this.historyList.innerHTML = "<p>No matches found.</p>";
            return;
        }
        games.forEach(game => {
            const div = document.createElement("div");
            div.className = "border-b py-2";
            div.innerHTML = `
                <b>${game.player1_name}</b> vs <b>${game.player2_name}</b>
                <span class="ml-2">Score: ${game.player1_score} - ${game.player2_score}</span>
                <span class="ml-2 text-gray-500 text-xs">${new Date(game.created_at).toLocaleString()}</span>
                <span class="ml-2 text-xs text-blue-600">${game.status}</span>
            `;
            this.historyList.appendChild(div);
        });

        this.paginationPrev.disabled = this.page === 1;
        this.paginationNext.disabled = this.page * this.pageSize >= total;
    }

	handleEsc = (e: KeyboardEvent) => {
		if (e.key === "Escape") {
			this.close();
		}
	}

    changePage(delta: number) {
        this.page += delta;
        this.loadHistory();
    }

    close() {
        this.remove();
    }
}

customElements.define("match-history-modal", MatchHistoryModal);
export { MatchHistoryModal };