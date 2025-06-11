import { routes } from "../../../src/routes"
import { BaseComponent } from "../../../src/BaseComponent";
import { AppControl } from "../../../src/AppControl";

console.log("executing home.ts");

class Chat extends BaseComponent {
	private chatMessages!: HTMLDivElement;
	private chatInput!: HTMLInputElement;
	private sendButton!: HTMLButtonElement;

	public	messageLimit: number = 5;

	constructor() {
		super("/pages/chat/chat.html");
	}

	override onInit(): void {
		console.log("Chat component initialized");
		this.sendButton.onclick = () => this.sendMessage();
		this.chatInput.onkeydown = (e: KeyboardEvent) => {
			if (e.key === "Enter") this.sendMessage();
		};
		AppControl.addChatListener(this.addMessage);
	}

	sendMessage() {
		const message = this.chatInput.value.trim();
		if (!message) return ;

		AppControl.sendChatMessage('chat-message', message);
		this.addMessage(message, "outgoing");
		this.chatInput.value = '';
	}

	addMessage = (message: string, type?: string): void => {
		if (type !== "outgoing") type = "incoming";

		const messageElement = document.createElement("div");
		messageElement.className = `chat-message-${type}`;
		messageElement.textContent = message;
		this.chatMessages.appendChild(messageElement);

		while (this.chatMessages.children.length > this.messageLimit)
			this.chatMessages.removeChild(this.chatMessages.firstChild!);

		this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
	}

	onDestroy(): void {
		AppControl.removeChatListener(this.addMessage);
		this.chatMessages.innerHTML = "";
	}
}

customElements.define("chat-component", Chat);

export { Chat };
