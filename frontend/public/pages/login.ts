import { views } from "../../src/views"
import { BaseComponent } from "../../src/BaseComponent";

console.log("executing home.ts");

class LoginPage extends BaseComponent {
	private login_b!: HTMLButtonElement;
	private username_i!: HTMLInputElement;
	private password_i!: HTMLInputElement;

	constructor() {
		super("/pages/login.html");
	}

	onInit(): void {
		this.login_b.addEventListener("click", async (e) => {
			e.preventDefault();
			const username = this.username_i.value.trim();
			const password = this.password_i.value.trim();

			if (!username || !password) {
				alert("Please enter both username and password.");
				return;
			}

			try {
				console.log("Attempting to log in with:", { username, password });
				const response = await fetch("http://localhost:3001/user/login", {
					method: "POST",
					headers: {
						"Content-Type": "application/json"
					},
					body: JSON.stringify({ username, password })
				});

				const data = await response.json();
				if (response.ok) {
					localStorage.setItem("token", data.message);
					// console.log("Login successful, token stored.");
					views.urlLoad("/home");
				} else
					alert(`Login failed: ${data.message}`);
			} catch (error) {
				// console.error("Error during login:", error);
				alert(error instanceof Error ? error.message : "An unexpected error occurred.");
			}
		});
	}
}


customElements.define("login-page", LoginPage);
views.registerPage("/login", LoginPage);
