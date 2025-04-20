import { views } from "../../src/views"
import { Page } from "../../src/Page";

console.log("executing home.ts");

const home: Page = new Page("/home");

let	varForLater: number = 0;

home.setDisplay(() => {
	varForLater = 5;
})
.setHtmlFrom("/pages/home.html")
.includePages("/navbar")

views.registerPage("/home", home);
