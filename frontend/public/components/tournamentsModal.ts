import { BaseComponent } from "../../src/BaseComponent";
import { TournamentInfo } from './tournamentInfo';
import { routes } from '../../src/routes';
import Api from '../../src/api/Api';
import Socket from '../../src/Socket';
import { showToast } from '../pages/toastNotification';

class TournamentsModal extends BaseComponent {
	private closeBtn!: HTMLButtonElement;
	private tournamentsList!: HTMLElement;
	private pagination!: HTMLElement;
	private prevPage!: HTMLButtonElement;
	private nextPage!: HTMLButtonElement;
	private pageInfo!: HTMLElement;

	page = 1;
	pageSize = 5;
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
			console.log(`Loading tournaments`);
			list.classList.add("hidden");
			pagination.classList.add("hidden");

			const { ok, message } = await Socket.request("get-all-tournaments", { pageNum: this.page, pageSizeNum: this.pageSize});
			if (!ok) {
				showToast(message, 2000, "error");
				return ;
			}
			const { tournaments, total } = message;

			this.totalPages = Math.ceil(total / this.pageSize);
			// console.log(`After calling getAllTournaments`);
			// console.log(`tournaments: ${JSON.stringify(tournaments)}`);
			// console.log(`total: ${JSON.stringify(total)}`);

			if (!Array.isArray(tournaments) || tournaments.length === 0) {
				list.innerHTML = "<p class='text-center text-gray-500'>No tournaments found.</p>";
				return;
			}

			list.classList.remove("hidden");
			list.innerHTML = "";

			for (const t of tournaments) {
				const tournamentInfo = new TournamentInfo(t);
				tournamentInfo.classList.add("cursor-pointer", "hover:bg-blue-50", "transition");
				tournamentInfo.addEventListener("click", () => {
					this.remove();
					//	console.log(`Tournament page for uuid: ${t.uuid}`);
					routes.navigate(`/tournament/${t.uuid}`);
				});
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