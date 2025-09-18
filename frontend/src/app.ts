import Socket from './Socket.ts';
import { AppControl } from './AppControl.ts';
import { ToastNotification } from '../public/pages/toastNotification.ts';
import { routes } from "./routes.ts";
import './style.css';

//("app start." + window.location.pathname);

export function	warnIf(condition :Boolean) {
	// if (condition)
		//(message);
	return (condition);
}

window.addEventListener('popstate', () => {
	//("app start2." + window.location.pathname);
	routes.navigate(window.location.pathname);
});

document.body.insertBefore(new ToastNotification() as Node, document.body.firstChild);
if (AppControl.getValidDecodedToken())
	Socket.init();
routes.navigate(window.location.pathname);
