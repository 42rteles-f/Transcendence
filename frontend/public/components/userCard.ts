import { AppControl } from '../../src/AppControl';
import { BaseComponent } from "../../src/BaseComponent";
import { routes } from '../../src/routes';
import { FriendListModal } from "../pages/friendListModal";
import { showToast } from '../pages/toastNotification';

class UserCard extends BaseComponent {
	private userCard!: HTMLDivElement;
    private userCardImage!: HTMLImageElement;
    private userCardNickname!: HTMLElement;
    private userCardUsername!: HTMLElement;
	private friendActionButton!: HTMLDivElement;

    constructor(user: any, uploadUrl: string, ownerId: number | string) {
        super("/components/userCard.html");
        this.user = user;
        this.uploadUrl = uploadUrl;
		this.ownerId = ownerId;
    }

    user: any;
    uploadUrl: string;
	ownerId: number | string | null;

    async onInit() {
		this.userCard.onclick = (e) => {
			if ((e.target as HTMLElement).closest("button")) return;
			const modal = this.closest("friend-list-modal") as FriendListModal & { closeModal?: () => void};
			if (modal && typeof modal.closeModal === "function")
				modal.closeModal();
			routes.navigate(`/profile/${this.user.id}`);
		}
        this.userCardImage.src = this.uploadUrl + this.user.profile_picture;
        this.userCardNickname.textContent = this.user.nickname || "";
        this.userCardUsername.textContent = "@" + (this.user.username || "");
		this.renderFriendActionButton();
    }

	renderFriendActionButton() {
        const status = this.user.friendship_status as string;
        const requesterId = this.user.requester_id;
        const token = AppControl.getValidDecodedToken() as { id: number | string } | null;
        const loggedUserId = token?.id;
		
		this.friendActionButton.innerHTML = "";

		if (String(loggedUserId) !== String(this.ownerId)) {
            return;
        }

        if (status === "pending") {
			if (requesterId && Number(requesterId) !== Number(loggedUserId)) {
				const acceptBtn = document.createElement("button");
				acceptBtn.className = "p-2 rounded-full bg-green-100 hover:bg-green-200 transition";
				acceptBtn.title = "Accept Friend Request";
				acceptBtn.innerHTML = `<span class="text-xl">&#10003;</span>`;
                acceptBtn.onclick = async (e) => {
                    e.stopPropagation();
                    try {
                        const message = await AppControl.friendRequest(this.user.id, "accepted");
                        showToast(message, 3000, "success");
						this.user.friendship_status = "accepted";
						this.renderFriendActionButton();
                        this.dispatchEvent(new CustomEvent("friendship-updated", { bubbles: true }));
                    } catch (error) {
                        showToast(error instanceof Error ? error.message : "Error", 3000, "error");
                    }
                };

				const rejectBtn = document.createElement("button");
				rejectBtn.className = "p-2 rounded-full bg-red-100 hover:bg-red-200 transition";
				rejectBtn.title = "Reject Friend Request";
				rejectBtn.innerHTML = `<span class="text-xl">&#10006;</span>`;

                rejectBtn.onclick = async (e) => {
                    e.stopPropagation();
                    try {
                        const message = await AppControl.friendRequest(this.user.id, "rejected");
                        showToast(message, 3000, "info");
						this.user.friendship_status = "rejected";
						this.renderFriendActionButton();
                        this.dispatchEvent(new CustomEvent("friendship-updated", { bubbles: true }));
                    } catch (error) {
                        showToast(error instanceof Error ? error.message : "Error", 3000, "error");
                    }
                };

				this.friendActionButton.appendChild(acceptBtn);
            	this.friendActionButton.appendChild(rejectBtn);
				return;
            } else if (requesterId && Number(requesterId) === Number(loggedUserId)) {
				const cancelBtn = document.createElement("button");
				cancelBtn.className = "p-2 rounded-full bg-yellow-100 hover:bg-yellow-200 transition";
				cancelBtn.title = "Cancel Friend Request";
				cancelBtn.innerHTML = `<span class="text-xl">&#8617;</span>`;
               
				cancelBtn.onclick = async (e) => {
					e.stopPropagation();
					try {
						const message = await AppControl.friendRequest(this.user.id, "removed");
						showToast(message, 3000, "info");
						this.user.friendship_status = "removed";
						this.renderFriendActionButton();
						this.dispatchEvent(new CustomEvent("friendship-updated", { bubbles: true }));
					} catch (error) {
						showToast(error instanceof Error ? error.message : "Error", 3000, "error");
					}
				};
				this.friendActionButton.appendChild(cancelBtn);
				return;
            }
			else
            	return;
        }

		if (status === "accepted") {
			const removeBtn = document.createElement("button");
			removeBtn.className = "p-2 rounded-full hover:bg-gray-300 transition";
			removeBtn.title = "Remove Friend";
			removeBtn.innerHTML = `<span class="text-xl">&#10006;</span>`;
			removeBtn.onclick = async (e) => {
				e.stopPropagation();
				try {
					const message = await AppControl.friendRequest(this.user.id, "removed");
					showToast(message, 3000, "success");
					this.user.friendship_status = "removed";
					this.renderFriendActionButton();
					this.dispatchEvent(new CustomEvent("friendship-updated", { bubbles: true }));
				} catch (error) {
					showToast(error instanceof Error ? error.message : "Error", 3000, "error");
				}
			};
			this.friendActionButton.appendChild(removeBtn);
			return;
		}

		if (status === "rejected" || status === "removed" || status === "no friendship" || !status) {
			const addBtn = document.createElement("button");
			addBtn.className = "p-2 rounded-full hover:bg-gray-300 transition";
			addBtn.title = "Send Friend Request";
			addBtn.innerHTML = `<span class="text-xl">&#43;</span>`;
			addBtn.onclick = async (e) => {
				e.stopPropagation();
				try {
					const message = await AppControl.friendRequest(this.user.id, "pending");
					showToast(message, 3000, "success");
					this.user.friendship_status = "pending";
					this.user.requester_id = loggedUserId;
					this.renderFriendActionButton();
					this.dispatchEvent(new CustomEvent("friendship-updated", { bubbles: true }));
				} catch (error) {
					showToast(error instanceof Error ? error.message : "Error", 3000, "error");
				}
			};
			this.friendActionButton.appendChild(addBtn);
			return;
		}

        let icon = "";
        let title = "";

        switch (status) {
            case "accepted":
                icon = "&#10006;";
                title = "Remove Friend";
                break;
            case "rejected":
                icon = "&#10060;";
                title = "Request Rejected";
                break;
            case "removed":
            case "no friendship":
            case null:
            case undefined:
                icon = "&#43;";
                title = "Add Friend";
                break;
            default:
                icon = "&#43;";
                title = "Add Friend";
                break;
        }

        const actionBtn = document.createElement("button");
        actionBtn.className = "p-2 rounded-full hover:bg-gray-300 transition";
        actionBtn.title = title;
        actionBtn.innerHTML = `<span class="w-6 h-6 flex items-center justify-center text-xl">${icon}</span>`;

        actionBtn.onclick = async (e) => {
            e.stopPropagation();
            try {
                if (status === "accepted") {
                    const message = await AppControl.friendRequest(this.user.id, "removed");
                    showToast(message, 3000, "success");
                } else if (status === "rejected" || status === "removed" || status === "no friendship" || !status) {
                    const message = await AppControl.friendRequest(this.user.id, "pending");
                    showToast(message, 3000, "success");
                }
                this.dispatchEvent(new CustomEvent("friendship-updated", { bubbles: true }));
            } catch (error) {
                showToast(error instanceof Error ? error.message : "Error", 3000, "error");
            }
        };

        this.friendActionButton.appendChild(actionBtn);
    }
}

customElements.define("user-card", UserCard);
export { UserCard };