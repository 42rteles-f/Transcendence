import { views } from "../../src/views"
import { BaseComponent } from "../../src/BaseComponent";

console.log("executing home.ts");

class LoginPage extends BaseComponent {

	constructor() {
		super("/pages/login.html");
	}

	onInit(): void {
		
	}
}

customElements.define("login-page", LoginPage);
views.registerPage("/login", LoginPage);
