import { views } from "../../src/views"
import { Page } from "../../src/Page";
import { BaseComponent } from "../../src/BaseComponent";

console.log("executing home.ts");

class HomePage extends BaseComponent {

	constructor() {
		super("/pages/home.html");
	}


}

customElements.define("home-page", HomePage);
views.registerPage("/home", HomePage);
