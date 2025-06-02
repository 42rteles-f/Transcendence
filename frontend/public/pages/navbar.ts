import { routes } from "../../src/routes";
import { BaseComponent } from "../../src/BaseComponent";

console.log("executing navbar copy");

class Navbar extends BaseComponent {
	private homeButton!: HTMLButtonElement;
	private navbarButton!: HTMLButtonElement;
	private pongButton!: HTMLButtonElement;
	private loginButton!: HTMLButtonElement;

	constructor() {
		super("/pages/navbar.html");
	}

	onInit() {
		this.homeButton.onclick = () => routes.urlLoad("/home");
		this.navbarButton.onclick = () => routes.urlLoad("/navbar");
		this.pongButton.onclick = () => routes.urlLoad("/pong");
		this.loginButton.onclick = () => routes.urlLoad("/login");
	}
}

customElements.define("custom-navbar", Navbar);

export { Navbar };
