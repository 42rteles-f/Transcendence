import { BaseComponent } from "../../src/BaseComponent";
import Api from "../../src/api/Api";
import { routes } from "../../src/routes";
import { showToast } from './toastNotification';

console.log("executing LoginPage.ts");

class LoginPage extends BaseComponent {
	private loginForm!: HTMLFormElement;
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

		Api.login(
			this.userInput.value.trim(),
			this.passInput.value.trim()
		)
		.then(() => {
			showToast("Login successful!", 2000, "success");
			routes.navigate("/home");
		})
		.catch((error) => {
			showToast(error.message, 3000, "error");
		});
	}

	createAccountClicked(e: Event) {
		e.preventDefault();
		routes.navigate("/register");
	}
}


customElements.define("login-page", LoginPage);

export { LoginPage };