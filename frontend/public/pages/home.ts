import { BaseComponent } from "../../src/BaseComponent";
import("./navbar.ts");
import("./chat/chat.ts");
import { Chat } from "./chat/chat.ts";

console.log("executing home.ts");

class HomePage extends BaseComponent {
	private chatRef!: Chat;

	constructor() {
		super("/pages/home.html");

		customElements.whenDefined('chat-component').then(() => {
			// console.log(`Chat component is defined (((${this.chatRef.messageLimit})))`);
			this.chatRef.messageLimit = 10;
		});
	}



	onInit(): void {
	}
}

customElements.define("home-page", HomePage);

export { HomePage };
