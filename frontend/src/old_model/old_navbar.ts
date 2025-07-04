import { routes } from "../routes"
import { Page } from "../../src/Page";

console.log("executing navbar.ts");

const navbar: Page = new Page("/navbar");

navbar.addEvents(
	{id: "home_b", type: "click", handler: () => routes.navigate("/home")},
	{id: "navbar_b", type: "click", handler: () => routes.navigate("/navbar")},
	{id: "pong_b", type: "click", handler: () => routes.navigate("/pong")},
)
.setHtmlFrom("/pages/navbar.html");

routes.register("/navbar", navbar);

// routes.registerView("navbar", () => new HomePage);


// const templates = new Map<string, string>();

// class BaseComponent extends HTMLElement {

// 	constructor(template: string) {
// 		super();
// 		if (templates.has(template)) {
// 			this.innerHTML = templates.get(template)!;
// 			this.onInit();
// 		}
// 		else {
// 			fetch(template).then(async (response) => {
// 				if (!response.ok) {
// 					throw new Error("Network response was not ok");
// 				}
// 				const html = await response.text();
// 				this.innerHTML = html;
// 				templates.set(template, html);
// 				this.onInit();
// 			})
// 		}
// 	}

// 	onInit() { }
// }

// customElements.define("base-component", BaseComponent);


// class HomePage extends BaseComponent {

// 	constructor() {
// 		super("/home/HomeView.html");
// 	}

// 	onInit() {
		
// 	}
// }

// customElements.define("home-page", HomePage);

// document.body.appendChild(new HomePage);