import { BaseComponent } from "../../src/BaseComponent";
import { routes } from "../../src/routes";
import { showToast } from './toastNotification';
import Api from '../../src/api/Api';

console.log("executing RegisterPage.ts");

class RegisterPage extends BaseComponent {
	private registerForm!: HTMLButtonElement;
	private userInput!: HTMLInputElement;
	private passInput!: HTMLInputElement;
	private confirmPassInput!: HTMLInputElement;
	private signIn!: HTMLButtonElement;
	private nickInput!: HTMLInputElement;

	constructor() {
		super("/pages/register.html");
	}

	onInit() {
		this.registerForm.onsubmit = (e: Event) => { this.register(e); };
		this.signIn.onclick = (e: Event) => { this.signInClicked(e); };
	}

	register(e: Event) {
		e.preventDefault();

		if (this.userInput.value.trim() === ""
			|| this.passInput.value.trim() === ""
			|| this.confirmPassInput.value.trim() === ""
			|| this.nickInput.value.trim() === "") {
			showToast("Fields cannot be empty.", 3000, "error");
			return;
		}

		if (this.passInput.value.trim() !== this.confirmPassInput.value.trim()) {
			showToast("Passwords do not match.", 3000, "error");
			return;
		}

		Api.register(
			this.userInput.value.trim(),
			this.nickInput.value.trim(),
			this.passInput.value.trim()
		)
		.then(() => {
			showToast("Registration successful!", 3000, "success");
			routes.navigate("/home");
		})
		.catch((error) => {
			showToast(error.message, 3000, "error");
		});
	}

	signInClicked(e: Event) {
		e.preventDefault();
		routes.navigate("/login");
	}
}


customElements.define("register-page", RegisterPage);

export { RegisterPage };