import { BaseComponent } from "./BaseComponent";
import { AppControl } from "./AppControl";

type AnyBaseComponent = new (...args: any[]) => BaseComponent;

export type Pointer<T> = (T | null);

export class PageManager {
    private pageMap:	Map<string, AnyBaseComponent>;
	private currentPage:	BaseComponent[];

    constructor() {
        this.pageMap = new Map();
		this.currentPage = [];
    }

    register(name: string, page: AnyBaseComponent) {
		if (this.pageMap.has(name)) return ;

        this.pageMap.set(name, page);
    }

	navigate(name: string) {
		let routeName = name;
		let param: string[] | null = null;

		param = name.split("/");
		routeName = `/${param[1]}`;
		param.shift();
		param.shift();

		if (!AppControl.getValidDecodedToken()
			&& routeName != "/login"
			&& routeName != "/register"){
			this.navigate("/login");
			return ;
		}

		if (AppControl.getValidDecodedToken()
			&& (routeName == "/login" || routeName == "/register")) {
			this.navigate("/home");
			return ;
		}

		console.log(`new ${name}`);
		this.currentPage.forEach((page) => {
			page.remove();
		});
		this.currentPage = [];

        if (!this.load(routeName, param)) {
			if (routeName != "/home") this.navigate("/home");
			return ;
        }
		if (window.location.pathname !== name)
			history.pushState({name: name}, '', name);
	}

	load(name: string, param?: string[] | null): Boolean {
		console.log(`load ${name}`);

        if (!this.pageMap.has(name)) {
			console.log(`PageManager: Component ${name} does not exist`);
			return (false);
        }

		const newComponent = new (this.pageMap.get(name) as any)(...param!);
		this.currentPage.push(newComponent);
		document.body.appendChild(newComponent as Node);
		return (true);
	}
}
