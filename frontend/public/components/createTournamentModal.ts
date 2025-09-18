import { BaseComponent } from "../../src/BaseComponent";
import { showToast } from "../pages/toastNotification";
import { routes } from '../../src/routes';
import Socket from '../../src/Socket';

class CreateTournamentModal extends BaseComponent {
	private closeBtn!: HTMLButtonElement;
	private cancelBtn!: HTMLButtonElement;
	private nameInput!: HTMLInputElement;
	private displayNameInput!: HTMLInputElement;
	private numberOfPlayersInput!: HTMLInputElement;
	private form!: HTMLFormElement;

	constructor() {
		super("/components/createTournamentModal.html");
		this.tabIndex = -1;
	}

	async onInit() {
		this.focus();
		this.addEventListener("keydown", (e) => {
			if (e.key === "Escape") {
				this.remove();
			}
		});
		this.closeBtn.addEventListener("click", () => this.remove());
		this.cancelBtn.addEventListener("click", () => this.remove());
		this.form.addEventListener("submit", (e) => this.handleSubmit(e));
	}

	async handleSubmit(e: Event) {
		e.preventDefault();
		const name = this.nameInput.value.trim();
		const displayName = this.displayNameInput.value.trim();
		if (!name || !displayName) {
			showToast("Please provide a valid tournament name and display name", 3000, "error");
			return;
		}
		const numberOfPlayers = parseInt(this.numberOfPlayersInput.value);

		if (!name || isNaN(numberOfPlayers) || (numberOfPlayers != 4 && numberOfPlayers != 8 && numberOfPlayers != 16)) {
			showToast("Please provide a valid name and number of players (4 or 8 or 16)", 3000, "error");
			return;
		}

		try {
			const { ok, message } = await Socket.request("create-tournament", { name, displayName, numberOfPlayers });
			if (!ok) {
				showToast(message, 2000, "error");
				//(`Error occurred during tournament creation`);
				return ;
			}
			
			//(`Tournament created! id=${message}`);
			//(`Redirecting to ${redirectUrl}`);

			showToast("Tournament created!", 2000, "success");
			this.remove();
			routes.navigate(`/tournament/${message}`);
		} catch (err: any) {
			showToast(err.message || "Failed to create tournament", 3000, "error");
		}
	}
}

customElements.define("create-tournament-modal", CreateTournamentModal);
export { CreateTournamentModal };