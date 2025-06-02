import { BaseComponent } from "../../src/BaseComponent";
import("./navbar.ts");
import("./chat/chat.ts");

console.log("executing home.ts");

class HomePage extends BaseComponent {

	constructor() {
		super("/pages/home.html");
	}

	onInit(): void {
	}
}

customElements.define("home-page", HomePage);

export { HomePage };
