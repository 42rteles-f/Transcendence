import { AppControl } from '../../src/AppControl';
import { BaseComponent } from "../../src/BaseComponent";
import { TournamentInfo } from './tournamentInfo';

class TournamentsModal extends BaseComponent {
	private closeBtn!: HTMLButtonElement;
	private tournamentsList!: HTMLElement;
	private pagination!: HTMLElement;
	private prevPage!: HTMLButtonElement;
	private nextPage!: HTMLButtonElement;
	private pageInfo!: HTMLElement;

    page = 1;
    pageSize = 10;
    totalPages = 1;

    constructor() {
        super("/components/tournamentsModal.html");
		this.tabIndex = -1;
    }

    async onInit() {
		this.focus();
		this.addEventListener("keydown", this.handleEsc);
        this.closeBtn?.addEventListener("click", () => {
            this.remove();
        });

        this.prevPage?.addEventListener("click", () => {
            if (this.page > 1) {
                this.page--;
                this.loadTournaments();
            }
        });

        this.nextPage?.addEventListener("click", () => {
            if (this.page < this.totalPages) {
                this.page++;
                this.loadTournaments();
            }
        });

        this.loadTournaments();
    }

    async loadTournaments() {
        const list = this.tournamentsList as HTMLElement;
        const pagination = this.pagination as HTMLElement;
        const pageInfo = this.pageInfo as HTMLElement;

        try {
            list.classList.add("hidden");
            pagination.classList.add("hidden");

			const response = await AppControl.getAllTournaments(this.page, this.pageSize) as {
					tournaments: {
						id: number,
						name: string,
						startDate: string,
						winnerId: number,
						ownerId: number,
						ownerName: string,
						maxPlayers: number,
						status: string,
						winnerName: string | null
					}[],
					total: number
			};


			const { tournaments, total } = response;
			this.totalPages = Math.ceil(total / this.pageSize);

			if (!Array.isArray(tournaments) || tournaments.length === 0) {
				list.innerHTML = "<p class='text-center text-gray-500'>No tournaments found.</p>";
				return;
			}

			list.classList.remove("hidden");
			list.innerHTML = "";

			for (const t of tournaments) {
				console.log(`Loading tournament: ${t.name} (ID: ${t.id})`);
				const tournamentInfo = new TournamentInfo(t);
				list.appendChild(tournamentInfo);
			}

            pagination.classList.remove("hidden");
            pageInfo.textContent = `Page ${this.page} of ${this.totalPages}`;
        } catch (e) {
			list.innerHTML = "<p class='text-center text-red-500'>Failed to load tournaments. Please try again later.</p>";
        }
    }

	handleEsc(e: KeyboardEvent) {
		if (e.key === "Escape") {
			this.remove();
		}
	}
}

customElements.define("tournaments-modal", TournamentsModal);
export { TournamentsModal };