import { views } from "../../src/views"

console.log("executing navbar.ts");

const newdiv :HTMLDivElement = document.createElement('div');
newdiv.setAttribute("style", "order: 0;");
newdiv.innerHTML = await fetch("/pages/navbar.html").then(response => response.text());

views.setElement("/navbar", () => {
	
})
.setHtml(newdiv)
.addEvents({id: "navbar_b", type: "click", handler: () => views.urlLoad("/navbar")});

