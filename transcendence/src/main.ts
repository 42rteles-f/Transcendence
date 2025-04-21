import { views } from "./views.ts";
await import("../public/pages/navbar copy.ts");
await import("../public/pages/home.ts");
await import("../public/pages/pong copy.ts");

// console.log(views.get("/home"))

console.log("app start." + window.location.pathname);

export function	warnIf(condition :Boolean, message :string) {
	if (condition)
		console.log(message);
	return (condition);
}

window.addEventListener('popstate', () => {
	console.log("app start2." + window.location.pathname);
	views.newLoad(window.location.pathname);
});

views.newLoad(window.location.pathname);

// document.addEventListener("DOMContentLoaded", function() {
// });
