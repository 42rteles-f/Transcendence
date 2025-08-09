import { BaseComponent } from "../../../src/BaseComponent";
import { routes } from "../../../src/routes";
import Socket from "../../../src/Socket";

console.log("executing home.ts");

interface IClient {
	id: string;
	socketId: string;
	name: string;
}

class Chat extends BaseComponent {
    private chatMessages!: HTMLDivElement;
    private chatInput!: HTMLInputElement;
    private sendButton!: HTMLButtonElement;
    private clientList!: HTMLUListElement;
    private chatName!: HTMLDivElement;

    private chatHistory: Map<string, HTMLDivElement[]> = new Map();

    public messageLimit: number = 5;

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
        Socket.addEventListener("disconnect", this.disconnect);
    }

    sendMessage() {
        const message = this.chatInput.value.trim();
        if (!message || !this.chatName.textContent) {
			this.chatInput.value = "";
			return;
		}

        Socket.emit("chat-message", {
            target: this.chatName.dataset.socketId,
            message: message,
        });
		console.log(`Sending message: ${message} to ${this.chatName.dataset.socketId}`);
        this.addMessage(
            { fromId: this.chatName.dataset.id!, fromName: this.chatName.textContent!, message },
            "outgoing"
        );
        this.chatInput.value = "";
    }

    disconnect = () => {
        this.clientList.innerHTML = "";
    };

    addMessage = (
        data: { fromId: string; fromName: string; message: string },
        type?: "incoming" | "outgoing"
    ): void => {
		data.fromId = data.fromId.toString();
        if (type !== "outgoing") type = "incoming";

        const messageElement = document.createElement("div");
        messageElement.className = `chat-message-${type}`;
        messageElement.textContent = data.message;

        if (!this.chatHistory.has(data.fromId))
            this.chatHistory.set(data.fromId, []);
        this.chatHistory.get(data.fromId)!.push(messageElement);

        if (this.chatName.textContent != data.fromName && type != "outgoing") {
			this.showNotification(data.fromId);
            return;
		}
        this.chatMessages.appendChild(messageElement);

        while (this.chatMessages.children.length > this.messageLimit)
            this.chatMessages.removeChild(this.chatMessages.firstChild!);

        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    };

	showNotification(clientId: string) {
		const listItem = this.clientList.querySelector(
			`li[data-client-id="${clientId}"]`
		);
		if (listItem) {
			const statusBall = listItem.querySelector("span");
			if (statusBall) {
				statusBall.style.visibility = "visible";
			}
		}
	}

	hideNotification(clientId: string) {
		const listItem = this.clientList.querySelector(
			`li[data-client-id="${clientId}"]`
		);
		if (listItem) {
			const statusBall = listItem.querySelector("span");
			if (statusBall) {
				statusBall.style.visibility = "hidden";
			}
		}
	}

	createNotification() {
		const statusBall = document.createElement("span");
		statusBall.className = "-top-1 -right-4 w-3 h-3 bg-blue-500 rounded-full";
		statusBall.style.visibility = "hidden";
		return (statusBall);
	}
	
	createButton(text: string, callback: () => void): HTMLButtonElement {
		const button = document.createElement("button");
		button.textContent = text;
		button.onclick = callback;
		return (button);
	}

	setClientChatElement(element: HTMLLIElement, client: IClient) {
		element.dataset.clientId = client.id;
		element.dataset.socketId = client.socketId;
		element.dataset.clientName = client.name;
		element!.textContent = client.name;
		element.onclick = () => this.openChat(client);
	}

	addClients = (
		clients: IClient[]
	) => {
		clients.forEach((client) => {
			let listItem: HTMLLIElement | null = this.clientList.querySelector(`li[data-client-id="${client.id}"]`);
			client.id = client.id.toString();
			if (!listItem) {
				listItem = document.createElement("li");
				listItem.className = "flex items-center justify-between pl-6 cursor-pointer p-2 hover:bg-gray-200";
				this.clientList.appendChild(listItem);
			} else {
				listItem.innerHTML = '';
			}

			this.setClientChatElement(listItem, client);

			listItem.appendChild(this.createNotification());
			listItem.appendChild(this.createButton("Invite", () => { console.log("Invite clicked for", client.name); }));
			listItem.appendChild(this.createButton("⃠", () => {
				Socket.emit("block-client", { targetId: client.id });
				this.removeClient(client);
			}));
		});
	};

	sendInvite() {

	}

    removeClient = (client: IClient) => {
        this.clientList.querySelectorAll("li").forEach((item) => {
            const clientId = item.dataset.clientId;
            if (client.id == clientId) {
                item.remove();
            }
        });
        console.log("Clients removed");
    };

    openChat(client: IClient) {
        this.chatName.textContent = `${client.name}`;
        this.chatName.dataset.id = client.id;
        this.chatName.dataset.socketId = client.socketId;
		this.chatName.style.cursor = "pointer";
		this.chatName.onclick = () => routes.navigate(`/profile/${client.id}`);
        this.chatMessages.innerHTML = "";
        this.chatInput.value = "";

        this.chatHistory.get(client.id)?.forEach((msg) => {
            this.chatMessages.appendChild(msg);
        });
		this.hideNotification(client.id);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        console.log("Chat opened");
    }

    onDestroy(): void {
        Socket.removeEventListener("chat-message", this.addMessage);
        Socket.removeEventListener("client-arrival", this.addClients);
        Socket.removeEventListener("client-departure", this.removeClient);
        Socket.removeEventListener("disconnect", this.disconnect);
        this.chatMessages.innerHTML = "";
    }
}

customElements.define("chat-component", Chat);

export { Chat };
