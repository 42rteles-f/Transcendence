import { BaseComponent } from "../../../src/BaseComponent";
import { AppControl } from "../../../src/AppControl";

console.log("executing home.ts");

class Chat extends BaseComponent {
	private chatMessages!: HTMLDivElement;
	private chatInput!: HTMLInputElement;
	private sendButton!: HTMLButtonElement;
	private clientList!: HTMLUListElement;
	private chatName!: HTMLDivElement;

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
		AppControl.onlineClientsListener(this.renderClients);
		AppControl.addChatListener(this.addMessage);
		// this.renderClients(["Client A", "Client B", "Client C"]);
	}

	sendMessage() {
		const message = this.chatInput.value.trim();
		if (!message) return ;

		AppControl.sendChatMessage('chat-message', this.chatName.dataset.id!, message);
		this.addMessage({fromId: "", fromName: "", message}, "outgoing");
		this.chatInput.value = '';
	}

	addMessage = (
		data: { fromId: string, fromName: string, message: string },
		type?: "incoming" | "outgoing"
	): void => {
		console.log("triggered");
		console.log(`((${data}))`);
		if (type !== "outgoing") type = "incoming";
		console.log(`chatName (${this.chatName.textContent}) != fromName (${data.fromName}) && type (${type})`);
		if (this.chatName.textContent != data.fromName && type != "outgoing") return ;

		const messageElement = document.createElement("div");
		messageElement.className = `chat-message-${type}`;
		messageElement.textContent = data.message;
		this.chatMessages.appendChild(messageElement);

		while (this.chatMessages.children.length > this.messageLimit)
			this.chatMessages.removeChild(this.chatMessages.firstChild!);

		this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
	}

	renderClients = (clients: { id: string, name: string }[]) => {
		this.clientList.innerHTML = "";
		clients.forEach(client => {
			const listItem = document.createElement("li");
			listItem.dataset.clientId = client.id;
			listItem.dataset.clientName = client.name
			listItem.textContent = client.name;
			listItem.className = "cursor-pointer p-2 hover:bg-gray-200";
			listItem.onclick = () => this.openChat(client);
			this.clientList.appendChild(listItem);
		});
	}

	openChat(client: { id: string, name: string }) {
		this.chatName.textContent = `${client.name}`;
		this.chatName.dataset.id = client.id
		this.chatMessages.innerHTML = "";
		this.chatInput.value = '';
		this.chatMessages.scrollTop = 0;
		console.log("Chat opened");
	}

	onDestroy(): void {
		AppControl.removeChatListener(this.addMessage);
		this.chatMessages.innerHTML = "";
	}
}

customElements.define("chat-component", Chat);

export { Chat };
