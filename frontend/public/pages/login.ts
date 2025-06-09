import { BaseComponent } from "../../src/BaseComponent";
import { AppControl } from "../../src/AppControl";
import { routes } from "../../src/routes";

console.log("executing LoginPage.ts");

class LoginPage extends BaseComponent {
	private loginForm!: HTMLButtonElement;

	constructor() {
		super("/pages/login.html");
	}

	onInit() {
		this.loginForm.onsubmit = (e: Event) => {
			e.preventDefault();
			AppControl.login("testuser", "testpassword")
				.then((success) => {
					if (success) {
							AppControl.createSocket();
							routes.navigate("/home");
						} else {
							alert("Login failed. Please try again.");
						}
					})
					.catch((error) => {
						console.error("Login error:", error);
						alert("An error occurred during login. Please try again later.");
					});
		}
	}
}

customElements.define("login-page", LoginPage);

export { LoginPage };