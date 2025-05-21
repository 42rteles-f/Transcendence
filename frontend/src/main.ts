import { views } from "./views.ts";
await import("../public/pages/navbar.ts");
await import("../public/pages/home.ts");
await import("../public/pages/pong.ts");

// console.log(views.get("/home"))

console.log("app start." + window.location.pathname);

export function	warnIf(condition :Boolean, message :string) {
	if (condition)
		console.log(message);
	return (condition);
}

window.addEventListener('popstate', () => {
	console.log("app start2." + window.location.pathname);
	views.urlLoad(window.location.pathname);
});

views.urlLoad(window.location.pathname);

// document.addEventListener("DOMContentLoaded", function() {
// });
