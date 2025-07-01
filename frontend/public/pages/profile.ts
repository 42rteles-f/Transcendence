import { BaseComponent } from "../../src/BaseComponent";
import { AppControl } from "../../src/AppControl";
import { routes } from "../../src/routes";
import { editProfile } from "./editProfile";
import { showToast } from './toastNotification';
import { MatchHistoryModal } from "./matchHistoryModal";
import { FriendListModal } from "./friendListModal";
import { LogoutModal } from "./logoutModal";

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
	private friendRequestStatus!: 'pending' | 'accepted' | 'rejected' | 'removed' | 'no friendship';
	private handleFriendRequestButton!: HTMLButtonElement;

	private userInfo: { username: string, nickname: string };

	constructor(userId: string | number | null) {
		super("/pages/profile.html");
		const token = AppControl.getValidDecodedToken() as { id: string | number, username?: string } | null;
		this.userId = userId ? userId : token?.id || "me";
		console.log(`checking userId: ${this.userId}`);
		this.userInfo = {
			username: "",
			nickname: ""
		};
	}
	
	async onInit() {
		this.editProfileButton.onclick = () => { this.showEditProfileModal() };
		this.logoutButton.onclick = () => { this.showLogoutConfirmation() };
		this.handleFriendRequestButton.onclick = () => { this.showFriendsListModal() };
	
		let id = this.userId;
		const loggedUser = AppControl.getValidDecodedToken() as { id: string | number, username?: string } | null;
		if (id !== "me" && Number(id) !== Number(loggedUser?.id)) {
			this.editProfileButton.remove();
			this.logoutButton.remove();
			this.handleFriendRequestButton.remove();
			try {
				const data = await AppControl.getFriendRequest(id);
				console.log("Friend request data:", data);

				if (typeof data === "object")
					this.friendRequestStatus = data.message;
				else if (typeof data === "string")
					this.friendRequestStatus = data as 'pending' | 'accepted' | 'rejected' | 'removed';
				
				if (this.friendRequestStatus === 'pending')
					this.handleFriendRequestButton.innerText = "Cancel Friend Request";

				else if (this.friendRequestStatus === 'accepted')
					this.handleFriendRequestButton.innerText = "Unfriend";

				else if (['rejected', 'removed', 'no friendship'].includes(this.friendRequestStatus))
					this.handleFriendRequestButton.innerText = "Send Friend Request";

			} catch (error) {
				if (error instanceof Error && error.message.includes("404")
					|| error instanceof Error && error.message.includes("No friendship found")) {
				this.friendRequestStatus = 'no friendship';
			}
				else
					showToast("Error fetching friend request status", 3000, "error");
			}
		}
		
		this.matchHistoryButton.onclick = () => { this.showMatchHistory(this.userId) };
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

	async showEditProfileModal() {
		const editProfilModal = new editProfile(this.userInfo);
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