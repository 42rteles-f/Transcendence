import { AppControl } from '../../../src/AppControl';
import { BaseComponent } from "../../../src/BaseComponent";
import { routes } from "../../../src/routes";
import Socket from "../../../src/Socket";

console.log("executing home.ts");

interface IClient {
	id: string;
	socketId: string;
	name: string;
}

interface IServerInvite {
	invite:		string,
	guest:		string,
	message:	string,
}

interface IServerRoom {
	room: string
}

interface IServerError {
	error: string
}

class Chat extends BaseComponent {
	private chatMessages!:	HTMLDivElement;
	private chatInput!:		HTMLInputElement;
	private sendButton!:	HTMLButtonElement;
	private clientList!:	HTMLUListElement;
	private chatName!:		HTMLDivElement;
	
	private chatHistory: Map<string, HTMLDivElement[]> = new Map();
	private inviteButtons:	Map<string, HTMLButtonElement> = new Map();

	private systemMessages: string[] = ["invite", "room", "error"];

	public messageLimit: number = 5;

	constructor() {
		super("/pages/chat/chat.html");
	}

	override async onInit() {
		console.log("Chat component initialized");
		this.sendButton.onclick = () => this.sendMessage();
		this.chatInput.onkeydown = (e: KeyboardEvent) => {
			if (e.key === "Enter") this.sendMessage();
		};
		
		Socket.notifyEventListener("client-arrival", this.addClients);
		Socket.addEventListener("chat-message", this.addMessage);
		Socket.addEventListener("client-departure", this.removeClient);
		Socket.addEventListener("disconnect", this.disconnect);
	}
 
	sendMessage() {
		const message = this.chatInput.value.trim();
		if (!message || !this.chatName.textContent || this.chatName.textContent === "server") {
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

		console.log(`message ${data.fromId}`)
		const messageElement = document.createElement("div");
		messageElement.className = `chat-message-${type}`;
		if (data.fromId === "system")
			this.addSystemMessage(messageElement, (data.message as any));
		else
			messageElement.textContent = data.message;

		if (!this.chatHistory.has(data.fromId))
			this.chatHistory.set(data.fromId, []);
		this.chatHistory.get(data.fromId)!.push(messageElement);

		if (this.chatName.textContent != data.fromName && type != "outgoing") {
			this.showNotification(data.fromId);
			return;
		}
		this.chatMessages.appendChild(messageElement);

		// while (this.chatMessages.children.length > this.messageLimit)
		// 	this.chatMessages.removeChild(this.chatMessages.firstChild!);

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
	
	createButton(client: IClient, text: string, callback: any): HTMLButtonElement {
		const button = document.createElement("button");
		button.id = client.id;
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

			const inviteButton = this.createButton(client, "Invite", (event: MouseEvent) => this.sendInvite(event, client));
			this.inviteButtons.set(client.id, inviteButton);
			listItem.appendChild(this.createNotification());
			listItem.appendChild(inviteButton);
			listItem.appendChild(this.createButton(client, "⃠", () => {
				if (client.id !== "system") {
					Socket.emit("block-client", { targetId: client.id });
					this.removeClient(client);
				}
			}));
		});
	};

	onSystemInvite(element: HTMLDivElement, response: IServerInvite) {
		element.textContent = response.message;
		if (!this.inviteButtons.get(response.invite))
			return ;

		const button = this.createButton(
			{id: `${response.invite}-${response.guest}`} as IClient,
			"Accept",
			() => Socket.emit("invite-pong-accept", { host: response.invite })
		);
		element.appendChild(button);
	}

	onSystemError(element: HTMLDivElement, response: IServerError) {
		element.textContent = response.error;
		console.log(`response.error ${response.error}`);
	}

	onSystemRoom(element: HTMLDivElement, response: IServerRoom) {
		if (response.room) {
			const button = this.createButton(
				{id: "server"} as IClient,
				"Join Room",
				() => routes.navigate("/pong")
			);
			element.appendChild(button);
		}
	}

	storageSystemMessage(data: any) {
		const stored = JSON.parse(localStorage.getItem("chatMessages") || "[]");

		stored.push({ senderId: "system", message: data });

		while (stored.length > 5) stored.shift();

		localStorage.setItem("chatMessages", JSON.stringify(stored));
	}

	addSystemMessage(element: HTMLDivElement, message: any) {
		const fieldName = this.systemMessages.find(f => f in message);
		console.log(`addSystemMessage fieldName ${fieldName}`)
		if (!fieldName) return false;

		this.storageSystemMessage(message);
		const methodName = `onSystem${fieldName.charAt(0).toUpperCase()}${fieldName.slice(1)}`;
		if (typeof (this as any)[methodName] === "function") {
			(this as any)[methodName](element, message);
			return true;
		}
	}

	sendInvite = (event: MouseEvent, client: IClient) => {
		const button: HTMLButtonElement = event.currentTarget as HTMLButtonElement;

		if (button.id === "system") {
			routes.navigate("/pong/local-play");
			return ;
		}
		Socket.emit("invite-pong", { target: `${client.id}`});
		button.textContent = "Cancel";
		button.onclick = (event) => this.cancelInvite(event, client);
	}

	cancelInvite = (event: MouseEvent, client: IClient) => {
		const button: HTMLButtonElement = event.currentTarget as HTMLButtonElement;
	
		Socket.emit("invite-cancel", { target : `${client.id}` });
		button.textContent = "Invite";
		button.onclick = (event) => this.sendInvite(event, client);
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

	openSystemMessages() {
		if (!this.chatHistory.has("system")) {
			const history = localStorage.getItem("systemChat")?.split('<>');
			history?.forEach((entry) => {
				this.addMessage({
					fromId: "system",
					fromName: this.chatName.textContent!,
					message: entry
				}, "incoming");
			})
		}
	}

	retrieveSystemMessages() {
		if (this.chatHistory.has("system")) return ;

		const stored = JSON.parse(localStorage.getItem("chatMessages") || "[]");

		if (!this.chatHistory.has("chatMessages"))
			this.chatHistory.set("chatMessages", []);

		stored.forEach((msg: any) => {
			const messageElement = document.createElement("div");
			messageElement.className = `chat-message-${msg.type}`;
			messageElement.textContent = msg.message;


			this.chatHistory.get(msg.fromId)!.push(messageElement);
		});
	}

	async openChat(client: IClient) {
		if (this.chatName.dataset.id === client.id) return ;

		this.chatName.textContent = `${client.name}`;
		this.chatName.dataset.id = client.id;
		this.chatName.dataset.socketId = client.socketId;
		this.chatName.style.cursor = "pointer";
		this.chatName.onclick = () => routes.navigate(`/profile/${client.id}`);
		this.chatMessages.innerHTML =  '';
	
		const { id: myId } = AppControl.getValidDecodedToken() as { id: string | number };
		if (this.chatHistory.has(client.id)) {
			this.chatHistory.get(client.id)!.forEach((msg) => {
				this.chatMessages.appendChild(msg);
			});
		}
		else {
			let res;
			if (client.id === "system") {
				res = { message: JSON.parse(localStorage.getItem("chatMessages") || "[]").map((m: any) => ({ senderId: m.senderId, message: m.message })) };
				localStorage.removeItem("chatMessages");
			}
			else
				res = await Socket.request('get-chat-history', { targetId: client.id });
			res.message.forEach((m: any) => {
				this.addMessage({
					fromId: this.chatName.dataset.id!,
					fromName: this.chatName.textContent!,
					message: m.message
				}, m.senderId === myId ? "outgoing" : "incoming");
			});
		}

		this.hideNotification(client.id);
		this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
		this.chatInput.value = "";
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
