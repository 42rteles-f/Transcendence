import { BaseComponent } from "../../src/BaseComponent";
import { AppControl } from "../../src/AppControl";
import { routes } from "../../src/routes";

console.log("executing ProfilePage.ts");

class ProfilePage extends BaseComponent {
	private userId!: string | number | null;
	private username!: HTMLElement;
	private nickname!: HTMLElement;
	private logoutButton!: HTMLButtonElement;

	constructor(userId?: string | number | null) {
		super("/pages/profile.html");
		this.userId = userId || null;
	}
	
	async onInit() {
		this.logoutButton.onclick = () => { this.logout() };
		let id = this.userId;
		if (!id || id === "me") {
			const token = AppControl.getValidDecodedToken() as { id: string | number, username?: string };
			id = token?.id || null;
		}

		if (!id) {
			routes.navigate("/404");
			return;
		}

		try {
			const profile = await AppControl.getProfile(id);

			this.username.innerHTML = profile.username;
			this.nickname.innerHTML = profile.nickname;

		} catch (error) {
			this.innerHTML = `<h2>Error loading profile</h2>
			<p>${error instanceof Error ? error.message : "Unknown error"}</p>`;
			setTimeout(() => {
				routes.navigate("/home");
			}
			, 2000);
		}
	}

	async logout() {
		try {
			await AppControl.logout();
			routes.navigate("/login");
		} catch (error) {
			console.error("Logout failed:", error);
			alert("Logout failed. Please try again.");
		}
	}
}


customElements.define("profile-page", ProfilePage);

export { ProfilePage };