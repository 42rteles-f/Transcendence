import { BaseComponent } from "../../src/BaseComponent";
import { AppControl } from "../../src/AppControl";
import { routes } from "../../src/routes";

console.log("executing LoginPage.ts");

class LoginPage extends BaseComponent {
	private loginForm!: HTMLButtonElement;
	private userInput!: HTMLInputElement;
	private passInput!: HTMLInputElement;
	private createAccount!: HTMLButtonElement;

	constructor() {
		super("/pages/login.html");
	}

	onInit() {
		this.loginForm.onsubmit = (e: Event) => { this.login(e); };
		this.createAccount.onclick = (e: Event) => { this.createAccountClicked(e); };
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
			alert(error.message);
		});
	}

	createAccountClicked(e: Event) {
		e.preventDefault();
		routes.navigate("/register");
	}
}


customElements.define("login-page", LoginPage);

export { LoginPage };