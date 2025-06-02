import { routes } from "../../../src/routes"
import { BaseComponent } from "../../../src/BaseComponent";
import { AppControl } from "../../../src/AppControl";

console.log("executing home.ts");

class Chat extends BaseComponent {
	private chatMessages!: HTMLDivElement;
	private chatInput!: HTMLInputElement;
	private sendButton!: HTMLButtonElement;

	constructor() {
		super("/pages/chat/chat.html");
	}

	onInit(): void {
		console.log("Chat component initialized");
		this.sendButton.onclick = () => this.sendMessage();
		this.chatInput.onkeydown = (e: KeyboardEvent) => {
			if (e.key === "Enter") this.sendMessage();
		};
		AppControl.addChatListener(this.addMessage);
	}

	sendMessage() {
		const message = this.chatInput.value.trim();
		console.log("Sending message:", message);
		if (!message) return ;

		AppControl.sendChatMessage('chat-message', message);
		this.addMessage("You: " + message, "outgoing");	
		this.chatInput.value = '';
	}

	addMessage = (message: string, type?: string): void => {
		if (type !== "outgoing") type = "incoming";
		const messageElement = document.createElement("div");
		messageElement.className = `chat-message-${type}`;
		messageElement.textContent = message;
		this.chatMessages.appendChild(messageElement);
	}

	onDestroy(): void {
		AppControl.removeChatListener(this.addMessage);
		this.chatMessages.innerHTML = ""; // Clear messages on destroy
	}
}

customElements.define("chat-component", Chat);
routes.register("/chat", Chat);
