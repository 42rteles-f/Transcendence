import { BaseComponent } from "../../src/BaseComponent";
import { TournamentsModal } from "../components/tournamentsModal";
import { CreateTournamentModal } from "../components/createTournamentModal";
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
		const createTournamentModal = new CreateTournamentModal();
		this.appendChild(createTournamentModal);
    }

    showAllTournamentsModal() {
		const tournamentsModal = new TournamentsModal();
		this.appendChild(tournamentsModal);
    }
}

customElements.define("tournaments-page", TournamentsPage);

export { TournamentsPage };