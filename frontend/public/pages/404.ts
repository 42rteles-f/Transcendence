import { BaseComponent } from "../../src/BaseComponent";

//("executing NotFoundPage.ts");

class NotFoundPage extends BaseComponent {

	constructor() {
		super("/pages/404.html");
	}

	onInit() {
	}
}


customElements.define("not-found-page", NotFoundPage);

export { NotFoundPage };