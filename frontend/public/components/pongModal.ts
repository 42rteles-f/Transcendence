import { BaseComponent } from "../../src/BaseComponent";
import { showToast } from "../pages/toastNotification";
import { routes } from "../../src/routes";
import Socket from '../../src/Socket';

const fakeMatchmaking = {
    searching: false,
    timeout: null as any,
    start(onFound: (gameId: string) => void) {
        this.searching = true;
        this.timeout = setTimeout(() => {
            if (this.searching) {
                onFound("pong-game-123");
            }
        }, 3000);
    },
    cancel() {
        this.searching = false;
        clearTimeout(this.timeout);
    }
};

class PongModal extends BaseComponent {
    private closeBtn!: HTMLButtonElement;
    private searchBtn!: HTMLButtonElement;
    private cancelBtn!: HTMLButtonElement;
    private statusMsg!: HTMLElement;
    private searching = false;

    constructor() {
		super("/components/pongModal.html");
        this.tabIndex = -1;
    }

    async onInit() {
		this.focus();
        this.closeBtn.onclick = () => {
			console.log("Closing Pong Modal");
			this.handleCancel();
		}
        this.cancelBtn.onclick = () => this.handleCancel();
        this.searchBtn.onclick = this.handleSearch;
        this.updateUI();
        this.addEventListener("keydown", (e) => {
            if (e.key === "Escape") this.handleCancel();
        });
		Socket.init();
    }
	
    handleSearch = () => {
		console.log("Searching for game...");
		if (this.searching) return;

        this.searching = true;
        this.updateUI();
        this.statusMsg.textContent = "Searching for an opponent...";
		Socket.addEventListener("search-game", this.handleGameFound);
    }

	handleGameFound = (gameId: string) => {
		this.searching = false;
		this.statusMsg.textContent = "Opponent found! Redirecting to game...";
		showToast(this.statusMsg.textContent, 2000, "success");
		setTimeout(() => {
			this.remove();
			routes.navigate(`/game/${gameId}`);
		}, 2000);
		Socket.removeEventListener("search-game", this.handleGameFound);
	}

    handleCancel = () => {
		console.log("Cancelling search...");
        if (this.searching)
            this.searching = false;
		Socket.removeEventListener("search-game", this.handleGameFound);
        this.remove();
    }

    updateUI() {
        this.searchBtn.disabled = this.searching;
        this.searchBtn.classList.toggle("opacity-50", this.searching);
        this.cancelBtn.textContent = this.searching ? "Cancel Search" : "Cancel";
        if (!this.searching) {
            this.statusMsg.textContent = "Click 'Search Game' to find an opponent.";
        }
    }
}

customElements.define("pong-modal", PongModal);
export { PongModal };