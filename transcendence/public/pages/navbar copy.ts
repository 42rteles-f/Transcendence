import { views } from "../../src/views";
import { BaseComponent } from "../../src/BaseComponent";

console.log("executing navbar copy");

class Navbar extends BaseComponent {
	constructor() {
		super("/pages/navbar.html");
		this.setAttribute("page", "/navbar");
		// this.onInit();
	}

	onInit() {
		console.log("navbar init");
		this.addEvents(
			{id: "navbar_b", type: "click", handler: () => views.newLoad("/navbar")},
			{id: "pong_b", type: "click", handler: () => views.newLoad("/pong")},
		)
	}
}

customElements.define("custom-navbar", Navbar);

views.registerView("/navbar", () => { return (new Navbar) });