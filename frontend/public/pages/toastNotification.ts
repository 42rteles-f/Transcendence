import { BaseComponent } from "../../src/BaseComponent";

class ToastNotification extends BaseComponent {
	private toastMessage !: HTMLSpanElement;
	private toastCloseButton !: HTMLButtonElement;
	private toastTimer !: HTMLDivElement;
	private timeoutId !: number;

	constructor() {
		super("/pages/toastNotification.html");
	}

	onInit() {
		this.classList.add("opacity-0", "pointer-events-none");
		this.classList.remove("opacity-100");
		this.style.display = "none";
		this.style.position = "fixed";
		this.style.top = "1.5rem";
		this.style.right = "1.5rem";
		this.style.zIndex = "9999";
		this.style.width = "30rem";
		this.style.maxWidth = "500px";
		this.style.height = "25rem";
		this.style.maxHeight = "250px";
		this.style.borderRadius = "0.5rem";
		this.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
		this.style.transition = "opacity 0.7s ease-in-out";

		this.toastTimer.style.transition = "width 3000ms linear";
		this.toastTimer.style.width = "100%";
		
		this.toastCloseButton.onclick = () => this.hide();
	}

	show(message: string, duration: number = 5000, type: "error" | "success" | "warning" | "info" = "info") {
		this.classList.remove("opacity-0", "pointer-events-none");
		this.classList.add("opacity-100");
		this.style.display = "flex";
		
		this.toastTimer.style.transition = "none";
		this.toastTimer.style.width = "100%";
		void this.toastTimer.offsetWidth;
		
		this.toastMessage.textContent = message;

		let bgColor = "";
		let textColor = "";
		let barColor = "";
		switch (type) {
			case "error":
				bgColor = "#FEE2E2";
				textColor = "#B91C1C";
				barColor = "#EF4444";
				break;
			case "success":
				bgColor = "#DCFCE7";
				textColor = "#166534";
				barColor = "#22C55E";
				break;
			case "warning":
				bgColor = "#FEF9C3";
				textColor = "#92400E";
				barColor = "#EAB308";
				break;
			default:
				bgColor = "dbeafe";
				textColor = "#1E40AF";
				barColor = "#3B82F6";
				break;
		}

		this.style.backgroundColor = bgColor;
		this.toastMessage.style.color = textColor;
		this.toastTimer.style.backgroundColor = barColor;
		this.toastTimer.style.transition = `width ${duration}ms linear`;
		this.toastTimer.style.width = "0%";

		if (this.timeoutId) clearTimeout(this.timeoutId);
		this.timeoutId = window.setTimeout(() => this.hide(), duration);
	}

	hide() {
		this.classList.remove("opacity-100");
		this.classList.add("opacity-0", "pointer-events-none");

		if (this.timeoutId) clearTimeout(this.timeoutId);

		setTimeout(() => {
			this.style.display = "none";
		}, 700);
		this.toastMessage.textContent = "";
	}
}


customElements.define("toast-notification", ToastNotification);

export function showToast(
	message: string,
	duration: number = 3000,
	type: "error" | "success" | "warning" | "info" = "info")
	{
	const toast = document.querySelector('toast-notification') as any;
	if (toast && typeof toast.show === 'function')
		toast.show(message, duration, type);
}

export { ToastNotification };