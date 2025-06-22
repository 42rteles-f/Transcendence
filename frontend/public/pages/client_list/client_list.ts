import { BaseComponent } from '../../../src/BaseComponent';

class ClientList extends BaseComponent {
	private clientList!: HTMLUListElement;

	constructor() {
		super("/pages/client_list/client_list.html");
	}

	onInit() {
		this.loadClients();
	}

	async loadClients() {
		try {
			const clients = await this.fetchClients();
			this.renderClients(clients);
		} catch (error) {
			console.error("Error loading clients:", error);
			this.clientList.innerHTML = `<li>Error loading clients</li>`;
		}
	}

	async fetchClients(): Promise<string[]> {
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve(["Client A", "Client B", "Client C"]);
			}, 1000);
		});
	}

	renderClients(clients: string[]) {
		this.clientList.innerHTML = "";
		clients.forEach(client => {
			const listItem = document.createElement("li");
			listItem.textContent = client;
			listItem.className = "cursor-pointer p-2 hover:bg-gray-200";
			listItem.onclick = () => {
				alert(`You clicked on ${client}`);
			};
			this.clientList.appendChild(listItem);
		});
	}
}

customElements.define("client-list", ClientList);

export { ClientList };