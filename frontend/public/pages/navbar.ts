import { routes } from "../../src/routes";
import { BaseComponent } from "../../src/BaseComponent";

console.log("executing navbar copy");

class Navbar extends BaseComponent {
	private homeButton!: HTMLButtonElement;
	private pongButton!: HTMLButtonElement;
	private profileButton!: HTMLButtonElement;
	private ticTacToeButton!: HTMLButtonElement;
	private tournamentsButton!: HTMLButtonElement;
	private localPlayButton!: HTMLButtonElement;
	//private tournamentButton!: HTMLButtonElement;

	constructor() {
		super("/pages/navbar.html");
	}

	onInit() {
		this.homeButton.onclick = () => routes.navigate("/home");
		this.profileButton.onclick = () => routes.navigate("/profile/me");
		this.ticTacToeButton.onclick = () => routes.navigate("/tic-tac-toe");
		this.tournamentsButton.onclick = () => routes.navigate("/tournaments");
		this.pongButton.onclick = () => routes.navigate("/pong");
		this.localPlayButton.onclick = () => routes.navigate("/pong/local-play");
		//this.tournamentButton.onclick = () => routes.navigate("/pong/tournament");
	}
}

customElements.define("custom-navbar", Navbar);

export { Navbar };
