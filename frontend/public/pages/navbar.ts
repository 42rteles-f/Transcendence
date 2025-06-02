import { routes } from "../../src/routes";
import { BaseComponent } from "../../src/BaseComponent";

console.log("executing navbar copy");

class Navbar extends BaseComponent {
	private home_b!: HTMLButtonElement;
	private navbar_b!: HTMLButtonElement;
	private pong_b!: HTMLButtonElement;
	private login_b!: HTMLButtonElement;

	constructor() {
		super("/pages/navbar.html");
	}

	onInit() {
		this.home_b.addEventListener("click", () => routes.urlLoad("/home"));
		this.navbar_b.addEventListener("click", () => routes.urlLoad("/navbar"));
		this.pong_b.addEventListener("click", () => routes.urlLoad("/pong"));
		this.login_b.addEventListener("click", () => routes.urlLoad("/login"));
	}
}

customElements.define("custom-navbar", Navbar);

export { Navbar };
