import { BaseComponent } from "../../src/BaseComponent";
import Api from "../../src/api/Api";
import { routes } from "../../src/routes";
import { showToast } from './toastNotification';

console.log("executing LoginPage.ts");

declare global {
    interface Window { handleGoogleSignIn: (response: any) => void }
}

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
		const browserWindow = window as any;
		if (browserWindow.google && browserWindow.google.accounts && browserWindow.google.accounts.id) {
			try {
				if (!browserWindow._googleIdInitialized) {
					browserWindow.google.accounts.id.initialize({
						client_id: "334758923868-9e7455i9lhaneut152ld1auenv7srtpb.apps.googleusercontent.com",
						callback: window.handleGoogleSignIn,
					});
					browserWindow._googleIdInitialized = true;
				}
				browserWindow.google.accounts.id.renderButton(
					document.querySelector('.g_id_signin'),
					{
						theme: "outline",
						size: "large",
						width: 390,
					}
				);
			} catch (error) {

			}
    }
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

window.handleGoogleSignIn = async (response: any) => {
	try {
	const res = await fetch(`${import.meta.env.VITE_API_URL}auth/google`, {
			method: "POST",
			headers: { "Content-Type": "application/json"},
			body: JSON.stringify({ credential: response.credential })
		});
		const data = await res.json();
		if (res.ok) {
			localStorage.setItem("authToken", data.token);
			showToast("Login successful with Google!", 2000, "success");
			routes.navigate("/home");
		} else {
			showToast(data.message || "Google login failed", 3000, "error");
		}
	} catch (error) {
		showToast("An error occurred during Google login", 3000, "error");
	}
}

customElements.define("login-page", LoginPage);

export { LoginPage };