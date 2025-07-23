import { BaseComponent } from "../../src/BaseComponent";
import { AppControl } from "../../src/AppControl";
import { showToast } from "../pages/toastNotification";
import { routes } from '../../src/routes';

class CreateTournamentModal extends BaseComponent {
    private closeBtn!: HTMLButtonElement;
    private submitBtn!: HTMLButtonElement;
    private cancelBtn!: HTMLButtonElement;
    private nameInput!: HTMLInputElement;
	private displayNameInput!: HTMLInputElement;
    private maxPlayersInput!: HTMLInputElement;
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
        const maxPlayers = parseInt(this.maxPlayersInput.value);

        if (!name || isNaN(maxPlayers) || maxPlayers < 2 || maxPlayers > 16) {
            showToast("Please provide a valid name and max players (2-16)", 3000, "error");
            return;
        }

        try {
            const res = await AppControl.createTournament(name, maxPlayers, displayName);
            showToast("Tournament created!", 2000, "success");
            this.remove();
            if (res && res.tournamentId)
				routes.navigate(`/tournament/${res.tournamentId}`);
        } catch (err: any) {
            showToast("Failed to create tournament", 3000, "error");
        }
    }
}

customElements.define("create-tournament-modal", CreateTournamentModal);
export { CreateTournamentModal };