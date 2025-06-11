import { BaseComponent } from "../../src/BaseComponent";
import { AppControl } from "../../src/AppControl";
import { routes } from "../../src/routes";

console.log("executing LoginPage.ts");

class LoginPage extends BaseComponent {
	private loginForm!: HTMLButtonElement;
	private userInput!: HTMLInputElement;
	private passInput!: HTMLInputElement;

	constructor() {
		super("/pages/login.html");
	}

	onInit() {
		this.loginForm.onsubmit = (e: Event) => { this.login(e); };
	}

	login(e: Event) {
		e.preventDefault();

		AppControl.login(
			this.userInput.value.trim(),
			this.passInput.value.trim()
		)
		.then(() => {
			routes.navigate("/home");
		})
		.catch((error) => {
			console.error("Login error:", error);
			alert("An error occurred during login. Please try again later.");
		});
	}
}


customElements.define("login-page", LoginPage);

export { LoginPage };