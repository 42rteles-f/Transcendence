import { BaseComponent } from "../../src/BaseComponent";
import { routes } from '../../src/routes';
import { FriendListModal } from "../pages/friendListModal";

class UserCard extends BaseComponent {
	private userCard!: HTMLDivElement;
    private userCardImage!: HTMLImageElement;
    private userCardNickname!: HTMLElement;
    private userCardUsername!: HTMLElement;

    constructor(user: any, uploadUrl: string) {
        super("/components/userCard.html");
        this.user = user;
        this.uploadUrl = uploadUrl;
    }

    user: any;
    uploadUrl: string;

    async onInit() {
		this.userCard.onclick = () => {
			const modal = this.closest("friend-list-modal") as FriendListModal & { closeModal?: () => void};
			if (modal && typeof modal.closeModal === "function")
				modal.closeModal();
			routes.navigate(`/profile/${this.user.id}`);
		}
        this.userCardImage.src = this.uploadUrl + this.user.profile_picture;
        this.userCardNickname.textContent = this.user.nickname || "";
        this.userCardUsername.textContent = "@" + (this.user.username || "");
    }
}

customElements.define("user-card", UserCard);
export { UserCard };