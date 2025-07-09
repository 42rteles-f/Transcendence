import { BaseComponent } from "../../src/BaseComponent";
import { AppControl } from "../../src/AppControl";
import { showToast } from "./toastNotification";
import { UserCard } from "../components/userCard";

class FriendListModal extends BaseComponent {
    private closeFriendList!: HTMLButtonElement;
    private friendsTab!: HTMLButtonElement;
    private notFriendsTab!: HTMLButtonElement;
    private userList!: HTMLElement;
    private userId: number | string | null;
    private uploadUrl: string;

    private activeTab: "friends" | "not-friends" | "requests" = "friends";
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

        await this.fetchUsersAndRequests();
        this.renderList();
    }

    async fetchUsersAndRequests() {
        try {
            this.allNotFriends = await AppControl.findUsers(this.userId);
            this.allFriends = await AppControl.getAllFriends(this.userId);
		
            const token = AppControl.getValidDecodedToken() as { id: number | string } | null;
            const loggedUserId = token?.id;

            this.allFriends = this.allFriends.filter((u: any) => u.id !== loggedUserId);
            this.allNotFriends = this.allNotFriends.filter((u: any) => u.id !== loggedUserId);
        } catch (error) {
            showToast("Failed to get users or requests.", 3000, "error");
        }
    }

    switchTab(tab: "friends" | "not-friends") {
        if (this.activeTab === tab) return;
        this.activeTab = tab;
        this.friendsTab.classList.toggle("active", tab === "friends");
        this.notFriendsTab.classList.toggle("active", tab === "not-friends");
        this.renderList();
    }

    renderList() {
        let users: any[] = [];

        if (this.activeTab === "friends") {
            users = this.allFriends;
        } else if (this.activeTab === "not-friends") {
            users = this.allNotFriends;
        }

		this.userList.innerHTML = "";

        users.forEach(u => {
            const userId = this.userId ?? "";
            const user = new UserCard(u, this.uploadUrl, userId, this.handleFriendAction.bind(this));
            this.userList.appendChild(user);
        });
    }

	private handleFriendAction = async () => {
		await this.fetchUsersAndRequests();
		this.renderList();
	}

    handleEsc = (e: KeyboardEvent) => {
        if (e.key === "Escape") this.closeModal();
    };

    closeModal() {
        this.remove();
    }
}

customElements.define("friend-list-modal", FriendListModal);

export { FriendListModal };