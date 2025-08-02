import { BaseComponent } from "../../src/BaseComponent";
import { AppControl } from "../../src/AppControl";
import { showToast } from "./toastNotification";
import { routes } from '../../src/routes';
import { JoinTournamentModal } from "../components/joinTournamentModal";
import Api from '../../src/api/Api';

class TournamentHubPage extends BaseComponent {
    private tournamentId!: number | null;
    private tournament: any;
    private userId!: number | string;

    private tournamentName!: HTMLElement;
    private status!: HTMLElement;
    private playersCount!: HTMLElement;
    private participantsList!: HTMLElement;
    private startBtn!: HTMLButtonElement;
    private joinBtn!: HTMLButtonElement;
    private unsubscribeBtn!: HTMLButtonElement;
    private cancelBtn!: HTMLButtonElement;
	private reportResultBtn!: HTMLButtonElement;

    private ownerName?: HTMLElement;
    private winnerName?: HTMLElement;
    private startDate?: HTMLElement;

    constructor(tournamentId: number | null) {
        super("/pages/tournamentHub.html");
        this.tournamentId = tournamentId;
    }

    async onInit() {
        if (!this.tournamentId) {
            routes.navigate("/404");
            return;
        }
        const { id } = AppControl.getValidDecodedToken() as { id: number | string };
        this.userId = Number(id);

        await this.loadTournament();

        this.startBtn.addEventListener("click", () => this.startTournament());
        this.joinBtn.addEventListener("click", () => this.joinTournament());
        this.unsubscribeBtn.addEventListener("click", () => this.unsubscribeTournament());
        this.cancelBtn.addEventListener("click", () => this.cancelTournament());
		this.reportResultBtn.addEventListener("click", () => this.reportResult());
    }

    async loadTournament() {
        try {
            if (!this.tournamentId)
                return;
            const res = await Api.getTournament(this.tournamentId);
			console.log("Loaded tournament:", res);
            this.tournament = res.message ?? res;

            this.tournamentName.textContent = this.tournament.name;

            this.status.textContent = this.tournament.status;
            this.status.className = "font-bold px-3 py-1 rounded transition";
            if (this.tournament.status === "waiting")
                this.status.classList.add("bg-yellow-200", "text-yellow-800");
            else if (this.tournament.status === "finished")
                this.status.classList.add("bg-green-200", "text-green-800");
            else if (this.tournament.status === "in progress" || this.tournament.status === "active")
                this.status.classList.add("bg-blue-200", "text-blue-800");
            else
                this.status.classList.add("bg-gray-200", "text-gray-800");

            this.playersCount.textContent = `${this.tournament.participants.length}/${this.tournament.maxPlayers}`;

            if (!this.ownerName) {
                this.ownerName = document.createElement("div");
                this.ownerName.className = "mb-2";
                this.status.parentElement?.parentElement?.insertAdjacentElement("afterend", this.ownerName);
            }
            this.ownerName.innerHTML = `<span class="font-semibold">Owner:</span> <span class="text-blue-700 font-bold cursor-pointer hover:underline" style="cursor:pointer">${this.tournament.ownerName}</span>`;
            this.ownerName.querySelector("span.text-blue-700")?.addEventListener("click", () => {
                routes.navigate(`/profile/${this.tournament.ownerId}`);
            });

            if (this.tournament.status === "finished" && this.tournament.winnerName) {
                if (!this.winnerName) {
                    this.winnerName = document.createElement("div");
                    this.winnerName.className = "mb-2";
                    this.ownerName.insertAdjacentElement("afterend", this.winnerName);
                }
                this.winnerName.innerHTML = `<span class="font-semibold">Winner:</span> <span class="text-green-700 font-bold cursor-pointer hover:underline" style="cursor:pointer">${this.tournament.winnerName}</span>`;
                this.winnerName.querySelector("span.text-green-700")?.addEventListener("click", () => {
                    routes.navigate(`/profile/${this.tournament.winnerId}`);
                });
            } else if (this.winnerName) {
                this.winnerName.remove();
            }

            if (!this.startDate) {
                this.startDate = document.createElement("div");
                this.startDate.className = "mb-2";
                this.ownerName.insertAdjacentElement("afterend", this.startDate);
            }
            this.startDate.innerHTML = `<span class="font-semibold">Start Date:</span> <span>${new Date(this.tournament.startDate).toLocaleString()}</span>`;

            this.participantsList.innerHTML = "";
            for (const p of this.tournament.participants) {
                const div = document.createElement("div");
                div.className = "flex items-center gap-2 bg-gray-100 hover:bg-blue-100 rounded-lg px-3 py-2 cursor-pointer shadow-sm transition";
                div.innerHTML = `
								<span class="font-semibold text-gray-700">${p.username}</span>
								<span class="text-sm text-gray-500">${p.displayName}</span>
								`;
                div.addEventListener("click", () => {
                    routes.navigate(`/profile/${p.id}`);
                });
                this.participantsList.appendChild(div);
            }

            this.updateButtons();
        } catch (e) {
			console.log("Error loading tournament:", e);
            showToast("Failed to load tournament", 3000, "error");
			routes.navigate("/404");
        }
    }

    updateButtons() {
        const isCreator = this.userId === this.tournament.ownerId;
        const isSubscribed = this.tournament.participants.some((p: any) => p.id === this.userId);
        const isActive = this.tournament.status === "waiting" || this.tournament.status === "active";
		const isFull = this.tournament.participants.length >= this.tournament.maxPlayers;
		const isInProgressOrFinished = this.tournament.status === "in progress" || this.tournament.status === "finished";

        this.startBtn.classList.toggle("hidden", !(isCreator && isActive));
        this.cancelBtn.classList.toggle("hidden", !(isCreator && isActive));
        this.joinBtn.classList.toggle("hidden", isCreator || isSubscribed || !isActive);
		this.joinBtn.disabled = isFull;
		this.joinBtn.style.cursor = isFull ? "not-allowed" : "";
		this.joinBtn.style.opacity = isFull ? "0.5" : "";
        this.unsubscribeBtn.classList.toggle("hidden", isCreator || !isSubscribed || !isActive);
		this.reportResultBtn.classList.toggle("hidden", !isInProgressOrFinished);
    }

    async startTournament() {
		if (!this.tournamentId) return;
		try {
			const res = await Api.startTournament(this.tournamentId);
			showToast(res || "Tournament started successfully", 3000, "success");
			this.loadTournament();
		} catch (e: Error | any) {
			showToast(e.message || "Failed to start tournament", 3000, "error");
		}
    }

    async joinTournament() {
		if (!this.tournamentId) return;
		try {
			const modal = new JoinTournamentModal(this.tournamentId);
			this.appendChild(modal);

			const onModalClosed = () => {
				this.loadTournament();
				this.removeEventListener("modal-closed", onModalClosed);
			};
			modal.addEventListener("modal-closed", onModalClosed);
		} catch (e: Error | any) {
			showToast(e.message || "Failed to join tournament", 3000, "error");
		}
    }

    async unsubscribeTournament() {
		if (!this.tournamentId) return;
		try {
			const res = await Api.unsubscribeTournament(this.tournamentId);
			showToast(res || "Unsubscribed from tournament successfully", 3000, "success");
			this.loadTournament();
		} catch (e: Error | any) {
			showToast(e.message || "Failed to unsubscribe from tournament", 3000, "error");
		}
    }

    async cancelTournament() {
		if (!this.tournamentId) return;
		try {
			const res = await Api.cancelTournament(this.tournamentId);
			showToast(res || "Tournament cancelled successfully", 3000, "success");
			routes.navigate("/tournaments");
		} catch (e: Error | any) {
			showToast(e.message || "Failed to cancel tournament", 3000, "error");
		}
    }

	async reportResult() {
		if (!this.tournamentId) return;
		try {
			routes.navigate(`/tournament-dashboard/${this.tournamentId}`);
		} catch (e: Error | any) {
			showToast(e.message || "Failed to report result", 3000, "error");
		}
	}
}

customElements.define("tournament-hub-page", TournamentHubPage);
export { TournamentHubPage };