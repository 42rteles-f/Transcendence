import { views } from "../../src/views"
import { BaseComponent } from "../../src/BaseComponent";

console.log("executing home.ts");

class HomePage extends BaseComponent {

	constructor() {
		super("/pages/home.html");
	}

	onInit(): void {
	}
}

customElements.define("home-page", HomePage);
views.registerPage("/home", HomePage);
