import { BaseComponent } from "../../src/BaseComponent";
import { routes } from "../../src/routes";
import { showToast } from './toastNotification';
import Api from '../../src/api/Api';

console.log("executing editProfile.ts");

class editProfile extends BaseComponent {
	private username!: HTMLInputElement;
	private profilePicture!: HTMLImageElement;
	private closeModalButton!: HTMLButtonElement;
	private editProfileForm!: HTMLFormElement;
	private userNameValue!: string;

	constructor(username: string) {
		super("/pages/editProfile.html");
		this.tabIndex = -1;
		this.userNameValue = username;
	}
	
	async onInit() {
		this.focus();
		this.addEventListener("keydown", this.handleEsc);
		this.closeModalButton.onclick = () => { this.closeEditModal() };
		this.editProfileForm.onsubmit = (e: Event) => { this.submitEditProfile(e); };
		this.username.value = this.userNameValue;
	}

	trimingForms() {
		this.username.value = this.username.value.trim();
		return !(this.username.value.length === 0);
	}

	async submitEditProfile(e: Event) {
		e.preventDefault();

		if (!this.trimingForms()) {
			showToast("Please fill in all fields.");
			return;
		}

		const formData = new FormData(this.editProfileForm);
		const profilePicture = formData.get("profilePicture") as File | null;

		if (profilePicture && profilePicture.size > 2 * 1024 * 1024) {
			showToast("Profile picture size exceeds 2MB limit.");
			return;
		}

		try {
			await Api.updateProfile(formData);
			showToast("Profile updated successfully!");
			this.closeEditModal();
			routes.navigate("/profile/me");
		} catch (error) {
			showToast(error instanceof Error ? error.message : "An error occurred while updating the profile.");
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