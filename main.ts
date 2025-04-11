import { PageManager } from "./PageManager.js";

export let views = new PageManager(window.location.pathname);

console.log("app start." + window.location.pathname);

export function	warnIf(condition :Boolean, message :string) {
	if (condition)
		console.log(message);
	return (condition);
}

document.addEventListener("DOMContentLoaded", function() {
    window.addEventListener('popstate', () => {
        console.log("app start2." + window.location.pathname);
        views.urlLoad(window.location.pathname);
    });

    views.urlLoad(window.location.pathname);
});
