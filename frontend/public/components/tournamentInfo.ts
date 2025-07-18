import { BaseComponent } from "../../src/BaseComponent";

type Tournament = {
    id: number;
    name: string;
    status: string;
    startDate: string;
    maxPlayers: number;
    ownerId: number;
	winnerId?: number | null;
	ownerName: string;
    winnerName?: string | null;
};

class TournamentInfo extends BaseComponent {
	private tournamentName!: HTMLHeadElement;
	private status!: HTMLSpanElement;
	private startDate!: HTMLSpanElement;
	private playersNum!: HTMLSpanElement;
	private ownerName!: HTMLSpanElement;
	private winnerName!: HTMLSpanElement;
	private tournament: Tournament;

    constructor(tournament: Tournament) {
        super("/components/tournamentInfo.html");
        this.tournament = tournament;
    }

    onInit() {
		this.tournamentName.innerText = this.tournament.name;
		this.status.innerText = this.tournament.status;
		if (this.tournament.status === "waiting")
			this.status.classList.add("!text-yellow-600");
		else if (this.tournament.status === "finished")
			this.status.classList.add("!text-green-600");
		else if (this.tournament.status === "in progress")
			this.status.classList.add("!text-red-600");
		else
			this.status.classList.add("!text-gray-600");
		this.startDate.innerText = new Date(this.tournament.startDate).toLocaleString();
		this.playersNum.innerText = this.tournament.maxPlayers.toString();
		this.ownerName.innerText = this.tournament.ownerName;
		if (this.tournament.winnerName)
			this.winnerName.innerText = this.tournament.winnerName;
		else
			this.winnerName.remove();
    }
}

customElements.define("tournament-info", TournamentInfo);
export { TournamentInfo };