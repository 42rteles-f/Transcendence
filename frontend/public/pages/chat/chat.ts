import { views } from "../../../src/views"
import { BaseComponent } from "../../../src/BaseComponent";

console.log("executing home.ts");

class Chat extends BaseComponent {

	constructor() {
		super("/pages/chat/chat.html");
	}

	onInit(): void {
		
	}
}

customElements.define("chat-component", Chat);
views.registerPage("/chat", Chat);
