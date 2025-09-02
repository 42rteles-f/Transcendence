import { BaseComponent } from "../../src/BaseComponent";
import { showToast } from "../pages/toastNotification";
import Socket from '../../src/Socket';

class JoinTournamentModal extends BaseComponent {
	private closeBtn!: HTMLButtonElement;
	private cancelBtn!: HTMLButtonElement;
	private confirmBtn!: HTMLButtonElement;
	private displayNameInput!: HTMLInputElement;
	private tournamentId: string;

	constructor(tournamentId: string) {
		super("/components/joinTournamentModal.html");
		this.tournamentId = tournamentId;
		this.tabIndex = -1;
	}

	async onInit() {
		this.focus();
		this.addEventListener("keydown", this.handleEsc);

		this.closeBtn.onclick = () => this.close();
		this.cancelBtn.onclick = () => this.close();
		this.confirmBtn.onclick = () => this.handleJoin();

		this.displayNameInput.focus();
	}

	async handleJoin() {
		const displayName = this.displayNameInput.value.trim();
		if (!displayName) {
			showToast("Display name is required.", 3000, "error");
			this.displayNameInput.focus();
			return;
		}
		try {
			const res = await Socket.request("tournament-join", { displayName, tournamentId: this.tournamentId });
			if (!res.ok) {
				showToast(res.message || "Failed to join tournament", 3000, "error");
				return ;
			}
			showToast("Successfully joined the tournament!", 3000, "success");
			console.log("modal should be removed");
			this.remove();
		} catch (e: any) {
			showToast(e.message || "Failed to join tournament", 3000, "error");
		}
	}

	handleEsc = (e: KeyboardEvent) => {
		if (e.key === "Escape") this.close();
	};

	close() {
		this.dispatchEvent(new CustomEvent("modal-closed", { bubbles: true }));
		this.remove();
	}
}

customElements.define("join-tournament-modal", JoinTournamentModal);
export { JoinTournamentModal };