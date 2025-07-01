import { BaseComponent } from "../../src/BaseComponent";
import { AppControl } from "../../src/AppControl";
import { showToast } from "./toastNotification";

class FriendListModal extends BaseComponent {
    private closeFriendList!: HTMLButtonElement;
    private friendsTab!: HTMLButtonElement;
    private notFriendsTab!: HTMLButtonElement;
    private friendSearch!: HTMLInputElement;
    private userList!: HTMLElement;
	private userId: number | string | null;
	private uploadUrl: string;

    private activeTab: "friends" | "not-friends" = "friends";
    private allFriends: any[] = [];
    private allNotFriends: any[] = [];

    constructor(userId: number | string | null, uploadUrl: string) {
        super("/pages/friendListModal.html");
        this.tabIndex = -1;
		this.userId = userId;
		this.uploadUrl = uploadUrl;
    }

    async onInit() {
        this.focus();
        this.addEventListener("keydown", this.handleEsc);

        this.friendsTab.onclick = () => this.switchTab("friends");
        this.notFriendsTab.onclick = () => this.switchTab("not-friends");
        this.closeFriendList.onclick = () => this.closeModal();
        this.friendSearch.oninput = () => this.renderList();

        // await this.fetchUsers();
        this.renderList();
    }

    async fetchUsers(userId: number | string | null) {
        try {
            const allUsers = await AppControl.getAllNotFriends(userId);
            const friends = await AppControl.getAllFriends(userId);
            const friendIds = new Set(friends.map((u: any) => u.id));
			const token = AppControl.getValidDecodedToken() as { id: number | string } | null;
            const loggedUserId = token?.id;

            this.allFriends = allUsers.filter((u: any) => friendIds.has(u.id) && u.id !== loggedUserId);
            this.allNotFriends = allUsers.filter((u: any) => !friendIds.has(u.id) && u.id !== loggedUserId);
        } catch (error) {
            showToast("Failed to get users.", 3000, "error");
        }
    }

    switchTab(tab: "friends" | "not-friends") {
        this.activeTab = tab;
        this.friendsTab.classList.toggle("active", tab === "friends");
        this.notFriendsTab.classList.toggle("active", tab === "not-friends");
        this.renderList();
    }

    renderList() {
        const search = this.friendSearch.value.trim().toLowerCase();
        const users = this.activeTab === "friends" ? this.allFriends : this.allNotFriends;
        const filtered = users.filter(u =>
            u.username.toLowerCase().includes(search) ||
            u.nickname?.toLowerCase().includes(search)
        );

        this.userList.innerHTML = filtered.length
            ? filtered.map(u => `
                <div class="user-row">
                    <img src="${u.profilePicture ? this.uploadUrl + u.profilePicture : "/default-avatar.png"}" class="avatar" />
                    <span class="user-nickname">${u.nickname || u.username}</span>
                    <span class="user-username">@${u.username}</span>
                </div>
            `).join("")
            : `<div class="no-users">No user found.</div>`;
    }

    handleEsc = (e: KeyboardEvent) => {
        if (e.key === "Escape") this.closeModal();
    };

    closeModal() {
        this.remove();
    }

		// async handleFriendRequest(status: 'pending' | 'accepted' | 'rejected' | 'removed' | 'no friendship') {
	// 	switch (this.friendRequestStatus) {
	// 		case 'pending':
	// 			this.friendRequestStatus = 'rejected';
	// 			break;
	// 		case 'accepted':
	// 			this.friendRequestStatus = 'removed';
	// 			break;
	// 		case 'rejected':
	// 		case 'removed':
	// 		case 'no friendship':
	// 			this.friendRequestStatus = 'pending';
	// 			break;
	// 		default:
	// 			this.friendRequestStatus = 'pending';
	// 	}
	// 	if (!this.userId || this.userId === "me") {
	// 		showToast("You cannot send a friend request to yourself", 3000, "error");
	// 		return;
	// 	}

	// 	try {
	// 		const id = Number(this.userId);
	// 		await AppControl.friendRequest(id, status);
	// 		showToast(`Friend request status updated: ${this.friendRequestStatus}`, 3000, "success");
	// 		routes.navigate(`/profile/${id}`);
	// 	} catch (error) {
	// 		showToast(`Error handling friend request: ${error instanceof Error ? error.message : "Unknown error"}`, 3000, "error");
	// 	}
	// }
}

customElements.define("friend-list-modal", FriendListModal);

export { FriendListModal };