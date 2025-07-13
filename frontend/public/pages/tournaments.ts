import { BaseComponent } from "../../src/BaseComponent";
import { TournamentsModal } from "../components/tournamentsModal";
import { showToast } from './toastNotification';

class TournamentsPage extends BaseComponent {
	private createTournamentButton!: HTMLButtonElement;
	private allTournamentsButton!: HTMLButtonElement;
    constructor() {
        super("/pages/tournaments.html");
    }

    onInit() {
        this.createTournamentButton.addEventListener('click', () => { this.showCreateTournamentModal(); });
        this.allTournamentsButton.addEventListener('click', () => { this.showAllTournamentsModal(); });
    }

    showCreateTournamentModal() {
    }

    showAllTournamentsModal() {
		const tournamentsModal = new TournamentsModal();
		this.appendChild(tournamentsModal);
    }
}

customElements.define("tournaments-page", TournamentsPage);

export { TournamentsPage };