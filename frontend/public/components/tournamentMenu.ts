import { AppControl } from '../../src/AppControl';
import { BaseComponent } from '../../src/BaseComponent'
import { routes } from '../../src/routes';
import { JoinTournamentModal } from "../components/joinTournamentModal";
import { showToast } from "../pages/toastNotification";
import Socket from '../../src/Socket';

interface ITournamentMenuInfo {
	name:				string;
	status:				string;
	participants:		any[];
	numberOfPlayers:	number;
	currentRound:		number;
	maxRound:			number;
	ownerId:			number;
	ownerName:			string;
	winnerId:			number;
	winnerName:			string;
	startDate:			string;
	id:		string;
};

class TournamentMenu extends BaseComponent {
	private userId!: 			number | string;
   	private tournamentName!:	HTMLElement;
    private status!:			HTMLElement;
    private playersCount!:		HTMLElement;
    private roundsCount!:		HTMLElement;
    private participantsList!:	HTMLElement;
	private joinBtn!:			HTMLButtonElement;
    private unsubscribeBtn!:	HTMLButtonElement;
    private cancelBtn!:			HTMLButtonElement;
	private ownerName!:			HTMLElement;
    private winnerName!:		HTMLElement;
    private startDate!:			HTMLElement;
	private menuInfo:			ITournamentMenuInfo;
	private closeBtn!:			HTMLButtonElement;

	constructor(info: ITournamentMenuInfo) {
		super('/components/tournamentMenu.html');
		this.menuInfo = info;
		this.tabIndex = -1;
		this.focus();
	}

	async onInit() {
		const { id } = AppControl.getValidDecodedToken() as { id: number | string };
		this.userId = Number(id);

		this.tournamentName.textContent = this.menuInfo.name;
		this.status.textContent = this.menuInfo.status;

		if (this.menuInfo.status === "waiting")
                this.status.classList.add("bg-yellow-200", "text-yellow-800");
		else if (this.menuInfo.status === "finished")
			this.status.classList.add("bg-green-200", "text-green-800");
		else if (this.menuInfo.status === "in progress" || this.menuInfo.status === "active")
			this.status.classList.add("bg-blue-200", "text-blue-800");
		else
			this.status.classList.add("bg-gray-200", "text-gray-800");

		this.playersCount.textContent = `${this.menuInfo.participants.length}/${this.menuInfo.numberOfPlayers}`;
		this.roundsCount.textContent = `${this.menuInfo.currentRound}/${this.menuInfo.maxRound}`;

		this.ownerName.innerText = this.menuInfo.ownerName;
		this.winnerName.innerText = this.menuInfo.winnerName ?? '?';

		this.ownerName.addEventListener("click", () => routes.navigate(`/profile/${this.menuInfo.ownerId}`));

		this.winnerName.addEventListener("click", () => routes.navigate(`/profile/${this.menuInfo.winnerId}`));

		this.startDate.innerText = `${this.menuInfo.startDate ? new Date(this.menuInfo.startDate).toLocaleString() : "not started yet"}`;

		this.joinBtn.addEventListener("click", () => this.joinTournament());
        this.unsubscribeBtn.addEventListener("click", () => this.unsubscribeTournament());
        this.cancelBtn.addEventListener("click", () => this.cancelTournament());

		this.renderParticipants();
		this.updateButtons();
		this.closeBtn.addEventListener('click', () => this.remove());
	}

	renderParticipants() {
		for (let i = 0; i < Number(this.menuInfo.participants.length); i++) {
			const player = this.menuInfo.participants[i];
			const playerDiv = document.createElement("div");
			playerDiv.classList.add("p-[0.2rem]", "rounded-lg", "cursor-pointer", "flex", "justify-center", "align-center", "w-[100%]")
			playerDiv.style.backgroundColor = 'rgba(210, 195, 97, 0.4)';
			playerDiv.innerHTML = `<p class='text-[1.2rem] font-bold'>${player.username}</p>: <span class='ml-1.5'>${player.displayName}</span>`
			playerDiv.addEventListener("click", () => routes.navigate(`/profile/${player.id}`));
			this.participantsList.appendChild(playerDiv);
		}
 	}

	updateButtons() {
        const isCreator = this.userId === Number(this.menuInfo.ownerId);
        const isSubscribed = this.menuInfo.participants.some((p: any) => (Number(p.id) === this.userId));
        const isActive = this.menuInfo.status === "waiting" || this.menuInfo.status === "active";
		const isFull = this.menuInfo.participants.length >= this.menuInfo.numberOfPlayers;

        this.cancelBtn.classList.toggle("hidden", !(isCreator && isActive));
        this.joinBtn.classList.toggle("hidden", isCreator || isSubscribed || !isActive);
		this.joinBtn.disabled = isFull;
		this.joinBtn.style.cursor = isFull ? "not-allowed" : "";
		this.joinBtn.style.opacity = isFull ? "0.5" : "";
        this.unsubscribeBtn.classList.toggle("hidden", isCreator || !isSubscribed || !isActive);
    }


    async joinTournament() {
		console.log(`tournamentId: ${this.menuInfo.id}`);
		if (!this.menuInfo.id) return;
		console.log(`hello`);
		try {
			const modal = new JoinTournamentModal(this.menuInfo.id);
			this.appendChild(modal);

			const onModalClosed = () => {
				this.removeEventListener("modal-closed", onModalClosed);
			};
			modal.addEventListener("modal-closed", onModalClosed);
		} catch (e: Error | any) {
			showToast(e.message || "Failed to join tournament", 3000, "error");
		}
    }

    async unsubscribeTournament() {
		if (!this.menuInfo.id) return;
		try {
			const res = await Socket.request("tournament-unsubscribe", { tournamentId: this.menuInfo.id});
			if (!res.ok) {
				showToast(res.message || "Failed to unsubscribe from tournament", 3000, "error");
				return ;
			}
			showToast("Unsubscribed from tournament successfully", 3000, "success");
		} catch (e: Error | any) {
			showToast(e.message || "Failed to unsubscribe from tournament", 3000, "error");
		}
    }

    async cancelTournament() {
		if (!this.menuInfo.id) return;
		try {
			const res = await Socket.request("tournament-cancel", { tournamentId: this.menuInfo.id });
			if (!res.ok) {
				showToast(res.message || "Failed to cancel tournament", 3000, "error");
				return ;
			}
			showToast("Tournament cancelled successfully", 3000, "success");
			routes.navigate("/tournaments");
		} catch (e: Error | any) {
			showToast(e.message || "Failed to cancel tournament", 3000, "error");
		}
    }
};

customElements.define('tournament-menu', TournamentMenu);
export { TournamentMenu };