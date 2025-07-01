import { BaseComponent } from "../../src/BaseComponent";
import { AppControl } from "../../src/AppControl";
import { routes } from "../../src/routes";
import { showToast } from "./toastNotification";

class LogoutModal extends BaseComponent {
    private closeLogoutModal!: HTMLButtonElement;
    private confirmLogout!: HTMLButtonElement;
    private cancelLogout!: HTMLButtonElement;

    constructor() {
        super("/pages/logoutModal.html");
        this.tabIndex = -1;
    }

    async onInit() {
        this.focus();
        this.addEventListener("keydown", this.handleEsc);

        this.closeLogoutModal.onclick = () => this.close();
        this.cancelLogout.onclick = () => this.close();
        this.confirmLogout.onclick = () => this.handleLogout();
    }

    handleEsc = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
            this.close();
        }
    };

    async handleLogout() {
        try {
            await AppControl.logout();
            showToast("Logged out successfully!", 2000, "success");
            this.close();
            routes.navigate("/login");
        } catch (error) {
            showToast("Failed to logout.", 3000, "error");
        }
    }

    close() {
        this.remove();
    }
}

customElements.define("logout-modal", LogoutModal);

export { LogoutModal };