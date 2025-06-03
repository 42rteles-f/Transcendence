import { BaseComponent } from "../../src/BaseComponent";
import { AppControl } from "../../src/AppControl";
import { routes } from "../../src/routes";

console.log("executing LoginPage.ts");

class LoginPage extends BaseComponent {
	private loginForm!: HTMLButtonElement;

	constructor() {
		super("/pages/login.html");
	}

	onInit(): void {
		this.loginForm.addEventListener("submit", (e) => {
			e.preventDefault();
			AppControl.createSocket();
			routes.navigate("/home");
			console.log("Form submitted — but not reloaded!");
		});
	}
}

customElements.define("login-page", LoginPage);

export { LoginPage };