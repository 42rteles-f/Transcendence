import { BaseComponent } from "../../src/BaseComponent";
import { AppControl } from "../../src/AppControl";
import { routes } from "../../src/routes";

console.log("executing editProfile.ts");

class editProfile extends BaseComponent {
	private username!: HTMLInputElement;
	private nickname!: HTMLInputElement;
	private profilePicture!: HTMLImageElement;
	private closeModalButton!: HTMLButtonElement;
	private editProfileForm!: HTMLFormElement;
	private userInfo: { username: string, nickname: string };

	constructor(userInfo: { username: string, nickname: string }) {
		super("/pages/editProfile.html");
		this.tabIndex = -1;
		this.userInfo = userInfo;
	}
	
	async onInit() {
		this.focus();
		this.addEventListener("keydown", this.handleEsc);
		this.closeModalButton.onclick = () => { this.closeEditModal() };
		this.editProfileForm.onsubmit = (e: Event) => { this.submitEditProfile(e); };
		this.username.value = this.userInfo.username;
		this.nickname.value = this.userInfo.nickname;
	}

	trimingForms() {
		this.username.value = this.username.value.trim();
		this.nickname.value = this.nickname.value.trim();

		return !(this.username.value.length === 0 || this.nickname.value.length === 0);
	}

	async submitEditProfile(e: Event) {
		e.preventDefault();

		if (!this.trimingForms()) {
			alert("Please fill in all fields.");
			return;
		}

		const formData = new FormData(this.editProfileForm);
		const profilePicture = formData.get("profilePicture") as File | null;

		if (profilePicture && profilePicture.size > 2 * 1024 * 1024) {
			alert("Profile picture size exceeds 2MB limit.");
			return;
		}

		try {
			await AppControl.updateProfile(formData);
			alert("Profile updated successfully!");
			this.closeEditModal();
			routes.navigate("/profile/me");
		} catch (error) {
			alert(error instanceof Error ? error.message : "An error occurred while updating the profile.");
		}
	}

	handleEsc(e: KeyboardEvent) {
		if (e.key === "Escape") {
			this.closeEditModal();
		}
	}

	closeEditModal() {
		this.remove();
	}
}


customElements.define("edit-profile", editProfile);

export { editProfile };