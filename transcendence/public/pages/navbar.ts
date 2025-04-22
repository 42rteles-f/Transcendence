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
			{id: "home_b", type: "click", handler: () => views.urlLoad("/home")},
			{id: "navbar_b", type: "click", handler: () => views.urlLoad("/navbar")},
			{id: "pong_b", type: "click", handler: () => views.urlLoad("/pong")},
		)
	}
}

customElements.define("custom-navbar", Navbar);

views.registerPage("/navbar", Navbar);