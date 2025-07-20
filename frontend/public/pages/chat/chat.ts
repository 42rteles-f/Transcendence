import { BaseComponent } from "../../../src/BaseComponent";
import Socket from "../../../src/Socket";

console.log("executing home.ts");

class Chat extends BaseComponent {
	private chatMessages!: HTMLDivElement;
	private chatInput!: HTMLInputElement;
	private sendButton!: HTMLButtonElement;
	private clientList!: HTMLUListElement;
	private chatName!: HTMLDivElement;

	private chatHistory: Map<string, HTMLDivElement[]> = new Map();

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
		Socket.init();
		Socket.addEventListener("chat-message", this.addMessage);
		Socket.addEventListener("client-arrival", this.addClients);
		Socket.addEventListener("client-departure", this.removeClient);
		Socket.addEventListener("disconnect", () => {
			this.clientList.innerHTML = "";
		});
	}

	sendMessage() {
		const message = this.chatInput.value.trim();
		if (!message) return ;

		Socket.emit("chat-message", {
			target: this.chatName.dataset.id,
			message: message
		});
		this.addMessage({fromId: "self", fromName: this.chatName.textContent!, message}, "outgoing");
		this.chatInput.value = '';
	}

	addMessage = (
		data: { fromId: string, fromName: string, message: string },
		type?: "incoming" | "outgoing"
	): void => {
		if (type !== "outgoing") type = "incoming";
		console.log(`chatName (${this.chatName.textContent}) != fromName (${data.fromName}) && type (${type})`);
		
		const messageElement = document.createElement("div");
		messageElement.className = `chat-message-${type}`;
		messageElement.textContent = data.message;

		if (!this.chatHistory.has(data.fromName)) this.chatHistory.set(data.fromName, []);
		this.chatHistory.get(data.fromName)!.push(messageElement);

		if (this.chatName.textContent != data.fromName && type != "outgoing") return ;
		this.chatMessages.appendChild(messageElement);

		while (this.chatMessages.children.length > this.messageLimit)
			this.chatMessages.removeChild(this.chatMessages.firstChild!);

		this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
	}

	addClients = (clients: { id: string, name: string }[]) => {
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

	removeClient = (client: { id: string, name: string }) => {
		this.clientList.querySelectorAll("li").forEach((item) => {
			const clientId = item.dataset.clientId;
			if (client.id == clientId){
				item.remove();
			}
		});
		console.log("Clients removed");
	}

	openChat(client: { id: string, name: string }) {
		this.chatName.textContent = `${client.name}`;
		this.chatName.dataset.id = client.id
		this.chatMessages.innerHTML = "";
		this.chatInput.value = '';
		if (!this.chatHistory.has(client.id)) {
			this.chatHistory.set(client.id, []);
		}
		this.chatHistory.get(client.name)?.forEach((msg) => {
			this.chatMessages.appendChild(msg);
		});
		this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
		console.log("Chat opened");
	}

	onDestroy(): void {
		Socket.emit("unsubscribe-chat");
		Socket.emit("unsubscribe-clients");
		Socket.removeEventListener("chat-message", this.addMessage);
		Socket.removeEventListener("client-arrival", this.addClients);
		Socket.removeEventListener("client-departure", this.removeClient);
		this.chatMessages.innerHTML = "";
	}
}

customElements.define("chat-component", Chat);

export { Chat };
