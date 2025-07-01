import { routes } from "../../src/routes";
import { BaseComponent } from "../../src/BaseComponent";

console.log("executing navbar copy");

class Navbar extends BaseComponent {
	private homeButton!: HTMLButtonElement;
	private pongButton!: HTMLButtonElement;
	private profileButton!: HTMLButtonElement;
	private ticTacToeButton!: HTMLButtonElement;

	constructor() {
		super("/pages/navbar.html");
	}

	onInit() {
		this.homeButton.onclick = () => routes.navigate("/home");
		this.pongButton.onclick = () => routes.navigate("/pong");
		this.profileButton.onclick = () => routes.navigate("/profile/me");
		this.ticTacToeButton.onclick = () => routes.navigate("/tic-tac-toe");
	}
}

customElements.define("custom-navbar", Navbar);

export { Navbar };
