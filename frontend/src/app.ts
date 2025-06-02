import { routes } from "./routes.ts";
import './style.css';

console.log("app start." + window.location.pathname);

export function	warnIf(condition :Boolean, message :string) {
	if (condition)
		console.log(message);
	return (condition);
}

window.addEventListener('popstate', () => {
	console.log("app start2." + window.location.pathname);
	routes.urlLoad(window.location.pathname);
});

routes.urlLoad(window.location.pathname);
