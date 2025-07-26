import { routes } from "../../src/routes";
import { BaseComponent } from "../../src/BaseComponent";
import { PongModal } from "../components/PongModal";


console.log("executing navbar copy");

class Navbar extends BaseComponent {
	private homeButton!: HTMLButtonElement;
	private pongButton!: HTMLButtonElement;
	private profileButton!: HTMLButtonElement;
	private ticTacToeButton!: HTMLButtonElement;
	private tournamentsButton!: HTMLButtonElement;

	constructor() {
		super("/pages/navbar.html");
	}

	onInit() {
		this.homeButton.onclick = () => routes.navigate("/home");
		this.profileButton.onclick = () => routes.navigate("/profile/me");
		this.ticTacToeButton.onclick = () => routes.navigate("/tic-tac-toe");
		this.tournamentsButton.onclick = () => routes.navigate("/tournaments");
		this.pongButton.onclick = () => this.appendChild(new PongModal());
	}
}

customElements.define("custom-navbar", Navbar);

export { Navbar };
