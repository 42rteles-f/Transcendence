import { BaseComponent } from "../../src/BaseComponent";
import { AppControl } from "../../src/AppControl";
import { showToast } from "./toastNotification";
import { UserCard } from "../components/userCard";

class FriendListModal extends BaseComponent {
    private closeFriendList!: HTMLButtonElement;
    private friendsTab!: HTMLButtonElement;
    private notFriendsTab!: HTMLButtonElement;
    private requestsTab!: HTMLButtonElement;
    private requestsToggleButton!: HTMLButtonElement;
    private friendSearch!: HTMLInputElement;
    private userList!: HTMLElement;
    private userId: number | string | null;
    private uploadUrl: string;

    private activeTab: "friends" | "not-friends" | "requests" = "friends";
    private allFriends: any[] = [];
    private allNotFriends: any[] = [];
    private receivedRequests: any[] = [];
    private sentRequests: any[] = [];
    private showReceivedRequests: boolean = true;

    constructor(userId: number | string | null, uploadUrl: string) {
        super("/pages/friendListModal.html");
        this.tabIndex = -1;
        this.userId = userId;
        this.uploadUrl = uploadUrl;
    }

    async onInit() {
		const token = AppControl.getValidDecodedToken() as { id: number | string } | null;
        this.focus();
        this.addEventListener("keydown", this.handleEsc);

        this.friendsTab.onclick = () => this.switchTab("friends");
        this.notFriendsTab.onclick = () => this.switchTab("not-friends");
        this.requestsTab.onclick = () => this.switchTab("requests");
        this.closeFriendList.onclick = () => this.closeModal();
        this.friendSearch.oninput = () => this.renderList();
        this.requestsToggleButton.onclick = () => {
            this.showReceivedRequests = !this.showReceivedRequests;
            this.renderList();
            this.updateToggleButton();
        };

		if (this.userId !== "me" && Number(this.userId) !== Number(token?.id)) {
			this.requestsTab.remove();	
		}

        await this.fetchUsersAndRequests();
        this.renderList();
        this.updateToggleButton();
    }

    async fetchUsersAndRequests() {
        try {
            const allUsers = await AppControl.findUsers(this.userId);
            const friends = await AppControl.getAllFriends(this.userId);
            const friendIds = new Set(friends.map((u: any) => u.id));
            const token = AppControl.getValidDecodedToken() as { id: number | string } | null;
            const loggedUserId = token?.id;

            this.allFriends = allUsers.filter((u: any) => friendIds.has(u.id) && u.id !== loggedUserId);
            this.allNotFriends = allUsers.filter((u: any) => !friendIds.has(u.id) && u.id !== loggedUserId);

            // const allRequests = await AppControl.getAllFriendRequests(this.userId);

            // this.receivedRequests = allRequests.filter((r: any) =>
            //     r.status === "pending" && r.friend_id === loggedUserId
            // );
            // this.sentRequests = allRequests.filter((r: any) =>
            //     r.status === "pending" && r.requester_id === loggedUserId
            // );
        } catch (error) {
            showToast("Failed to get users or requests.", 3000, "error");
        }
    }

    switchTab(tab: "friends" | "not-friends" | "requests") {
        if (this.activeTab === tab) return;
        this.activeTab = tab;
        this.friendsTab.classList.toggle("active", tab === "friends");
        this.notFriendsTab.classList.toggle("active", tab === "not-friends");
        this.requestsTab.classList.toggle("active", tab === "requests");
        this.renderList();
        this.updateToggleButton();
    }

    renderList() {
        const search = this.friendSearch.value.trim().toLowerCase();
        let users: any[] = [];

        if (this.activeTab === "friends") {
            users = this.allFriends;
        } else if (this.activeTab === "not-friends") {
            users = this.allNotFriends;
        } else if (this.activeTab === "requests") {
            users = this.showReceivedRequests ? this.receivedRequests : this.sentRequests;
        }

        const filtered = users.filter(u =>
            (u.username?.toLowerCase().includes(search) ||
            u.nickname?.toLowerCase().includes(search))
        );

		filtered.forEach(u => {
			console.log(`user: ${JSON.stringify(u)}`);
			console.log(`User: ${u.username}, Nickname: ${u.nickname}, Profile Picture: ${u.profilePicture}`);
		});

		this.userList.innerHTML = "";

		filtered.forEach(u => {
			const user = new UserCard(u, this.uploadUrl);
			this.userList.appendChild(user);
		});
    }

    updateToggleButton() {
        if (this.activeTab !== "requests") {
            this.requestsToggleButton.style.display = "none";
        } else {
            this.requestsToggleButton.style.display = "block";
            this.requestsToggleButton.innerText = this.showReceivedRequests
                ? "Show Sent Requests"
                : "Show Received Requests";
        }
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