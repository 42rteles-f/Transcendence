import { views } from "./views.ts";
import './style.css';
await import("../public/pages/navbar.ts");
await import("../public/pages/home.ts");
await import("../public/pages/pong.ts");
await import("../public/pages/chat/chat.ts");
await import("../public/pages/login.ts");

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
