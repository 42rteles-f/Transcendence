import { BaseComponent } from "../../src/BaseComponent";
import { AppControl } from "../../src/AppControl";
import { routes } from "../../src/routes";
import { editProfile } from "./editProfile";
import { showToast } from './toastNotification';
import { MatchHistoryModal } from "./matchHistoryModal";

console.log("executing ProfilePage.ts");

class ProfilePage extends BaseComponent {
	private userId!: string | number | null;
	private username!: HTMLElement;
	private nickname!: HTMLElement;
	private profilePicture!: HTMLImageElement;
	private logoutButton!: HTMLButtonElement;
	private editProfileButton!: HTMLButtonElement;
	private gamesPlayed!: HTMLElement;
	private gamesWon!: HTMLElement;
	private gamesLost!: HTMLElement;
	private matchHistoryButton!: HTMLButtonElement;

	private userInfo: { username: string, nickname: string };

	constructor(userId?: string | number | null) {
		super("/pages/profile.html");
		const pathParts = window.location.pathname.split("/");
		this.userId = pathParts.length > 2 ? pathParts[2] : userId || null;
		this.userInfo = {
			username: "",
			nickname: ""
		};
	}
	
	async onInit() {
		this.logoutButton.onclick = () => { this.logout() };
		this.editProfileButton.onclick = () => { this.editProfile() };
		this.matchHistoryButton.onclick = () => { this.showMatchHistory(this.userId) };
		let id = this.userId;
		if (!id || id === "me") {
			const token = AppControl.getValidDecodedToken() as { id: string | number, username?: string };
			id = token?.id || null;
			this.userId = id;
		}

		if (!id) {
			routes.navigate("/404");
			return;
		}

		try {
			const profile = await AppControl.getProfile(id);

			this.username.innerText = profile.username;
			this.nickname.innerText = profile.nickname;
			this.gamesPlayed.innerText = `Games Played: ${profile.gamesPlayed.toString()}`;
			this.gamesWon.innerText = `Games Won: ${profile.gamesWon.toString()}`;
			this.gamesLost.innerText = `Games lost: ${profile.gamesLost.toString()}`;
			this.profilePicture.src = `${import.meta.env.VITE_API_URL}uploads/${profile.profilePicture}`;

			this.userInfo.username = profile.username;
			this.userInfo.nickname = profile.nickname;

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
			showToast("Logout successful!", 3000, "success");
			routes.navigate("/login");
		} catch (error) {
			showToast("Logout failed. Please try again.", 3000, "error");
		}
	}

	async editProfile() {
		const editProfilModal = new editProfile(this.userInfo);
		this.appendChild(editProfilModal);
	}

	async showMatchHistory(id: number | string | null) {
		const modal = new MatchHistoryModal(Number(id));
		document.body.appendChild(modal);
	}
}


customElements.define("profile-page", ProfilePage);

export { ProfilePage };