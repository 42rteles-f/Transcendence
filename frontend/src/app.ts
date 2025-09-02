import Socket from './Socket.ts';
import { AppControl } from './AppControl.ts';
import { ToastNotification } from '../public/pages/toastNotification.ts';
import { routes } from "./routes.ts";
import './style.css';

console.log("app start." + window.location.pathname);

//(() => {console.warn = () => {}; console.error = () => {};
//	Object.defineProperty(console, 'warn', { value: () => {}, writable: false, configurable: false });
//	Object.defineProperty(console, 'error', { value: () => {}, writable: false, configurable: false });
//})();

export function	warnIf(condition :Boolean, message :string) {
	if (condition)
		console.log(message);
	return (condition);
}

window.addEventListener('popstate', () => {
	console.log("app start2." + window.location.pathname);
	routes.navigate(window.location.pathname);
});

document.body.insertBefore(new ToastNotification() as Node, document.body.firstChild);
if (AppControl.getValidDecodedToken())
	Socket.init();
routes.navigate(window.location.pathname);
