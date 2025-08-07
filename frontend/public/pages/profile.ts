import { BaseComponent } from "../../src/BaseComponent";
import { AppControl } from "../../src/AppControl";
import { routes } from "../../src/routes";
import { editProfile } from "./editProfile";
import { showToast } from './toastNotification';
import { MatchHistoryModal } from "./matchHistoryModal";
import { FriendListModal } from "./friendListModal";
import { LogoutModal } from "./logoutModal";
import Socket from "../../src/Socket";
import Api from '../../src/api/Api';

console.log("executing ProfilePage.ts");

class ProfilePage extends BaseComponent {
	private userId!: string | number | null;
	private username!: HTMLElement;
	private profilePicture!: HTMLImageElement;
	private logoutButton!: HTMLButtonElement;
	private editProfileButton!: HTMLButtonElement;
	private gamesPlayed!: HTMLElement;
	private gamesWon!: HTMLElement;
	private gamesLost!: HTMLElement;
	private matchHistoryButton!: HTMLButtonElement;
	private friendshipStatus!: HTMLElement;
	private friendListsButton!: HTMLButtonElement;
	private onlineStatus!: HTMLSpanElement;

	constructor(userId: string | number | null) {
		super("/pages/profile.html");
		const token = AppControl.getValidDecodedToken() as { id: string | number, username?: string } | null;
		this.userId = userId ? userId : token?.id || "me";
		console.log(`checking userId: ${this.userId}`);
	}
	
	async onInit() {
		this.editProfileButton.onclick = () => { this.showEditProfileModal() };
		this.editProfileButton.onclick = () => { this.showEditProfileModal() };
		this.logoutButton.onclick = () => { this.showLogoutConfirmation() };
		this.friendListsButton.onclick = () => { this.showFriendsListModal() };
		this.matchHistoryButton.onclick = () => { this.showMatchHistory(this.userId) };
	
		let id = this.userId;
		const loggedUser = AppControl.getValidDecodedToken() as { id: string | number | null, username?: string } | null;
		if (id !== "me" && Number(id) !== Number(loggedUser?.id)) {
			try {
				this.editProfileButton.remove();
				this.logoutButton.remove();
				const friendRequest = await Api.getFriendRequest(id);
				if (friendRequest.status === "accepted") {
					this.friendshipStatus.innerText = "Friendship Status: Friends";
				} else if (friendRequest.status === "pending") {
					this.friendshipStatus.innerText = "Friendship Status: Pending";
				} else {
					this.friendshipStatus.innerText = "Friendship Status: Not Friends";
				}
				console.log(`Friend request status: ${friendRequest.status}`);
			} catch (error) {
				if (error instanceof Error
					&& typeof error.message === "string"
					&& error.message.includes("Cannot get friend request with self")) {
				} else if (error instanceof Error) {
					showToast(error.message, 3000)
				}
			}
		} else {
			this.friendshipStatus.remove();
		}
		
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
			const profile = await Api.getProfile(id);
			this.username.innerText = profile.username;
			this.gamesPlayed.innerText = `Games Played: ${profile.gamesPlayed.toString()}`;
			this.gamesWon.innerText = `Games Won: ${profile.gamesWon.toString()}`;
			this.gamesLost.innerText = `Games lost: ${profile.gamesLost.toString()}`;
			this.profilePicture.src = `${import.meta.env.VITE_API_URL}uploads/${profile.profilePicture}`;
		} catch (error) {
			routes.navigate("/404");
		}
		Socket.init();
		Socket.addEventListener("client-arrival", (clients: { id: string, name: string }[]) => {
			if (clients.find(client => client.name === this.username.textContent)) {
				this.onlineStatus!.style.backgroundColor = "green";
			}
		})
	}

	async showEditProfileModal() {
		const editProfilModal = new editProfile(this.username.textContent || "");
		this.appendChild(editProfilModal);
	}

	async showMatchHistory(id: number | string | null) {
		const modal = new MatchHistoryModal(Number(id));
		document.body.appendChild(modal);
	}

	async showFriendsListModal() {
		const modal = new FriendListModal(this.userId, import.meta.env.VITE_API_URL + "uploads/");
		document.body.appendChild(modal);
	}

	async showLogoutConfirmation() {
		const modal = new LogoutModal();
		document.body.appendChild(modal);
	}
}


customElements.define("profile-page", ProfilePage);

export { ProfilePage };