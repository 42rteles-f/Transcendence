import { BaseComponent } from "../../src/BaseComponent";
import { AppControl } from "../../src/AppControl";
import { routes } from "../../src/routes";

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
			alert("Fields cannot be empty.");
			return;
		}

		if (this.passInput.value.trim() !== this.confirmPassInput.value.trim()) {
			alert("Passwords do not match.");
			return;
		}

		// console.log(`user: ${this.userInput.value.trim()}`);
		// console.log(`pass: ${this.passInput.value.trim()}`);

		AppControl.register(
			this.userInput.value.trim(),
			this.nickInput.value.trim(),
			this.passInput.value.trim()
		)
		.then(() => {
			routes.navigate("/home");
		})
		.catch((error) => {
			// console.error("Register error:", error);
			// console.error("Register error:", error.message);
			alert(error.message);
		});
	}

	signInClicked(e: Event) {
		e.preventDefault();
		routes.navigate("/login");
	}
}


customElements.define("register-page", RegisterPage);

export { RegisterPage };