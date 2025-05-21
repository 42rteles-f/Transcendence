import { BaseComponent } from "./BaseComponent";
type AnyBaseComponent = new (...args: any[]) => BaseComponent;


export class PageManager {
    private componentMap	:Map<string, AnyBaseComponent>;
	private currentPage: (BaseComponent | null)[];

    constructor() {
        this.componentMap = new Map();
		this.currentPage = [];
    }

    registerPage(name: string, page: typeof BaseComponent) {
		if (this.componentMap.has(name)) return ;

        this.componentMap.set(name, page);
    }

	urlLoad(name: string) {
		console.log(`new ${name}`);
		this.currentPage.forEach(page => page?.remove());

        if (!this.load(name)) {
			if (name != "/home") this.urlLoad("/home");
			return ;
        }
		if (window.location.pathname !== name)
			history.pushState({name: name}, '', name);
	}

	load(name: string): Boolean {
		console.log(`load ${name}`);

        if (!this.componentMap.has(name)) {
			console.log(`PageManager: Component ${name} does not exist`);
			return (false);
        }
		const newPage = new (this.componentMap.get(name) as any);
		this.currentPage.push(newPage);
		document.body.appendChild(newPage as Node);
		return (true);
	}
}
