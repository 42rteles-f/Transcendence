import { Page } from "./Page";
import { AppControl } from "./AppControl";

type EventInfo = {
	id: string;
	type: string;
	handler: EventListener;
};

export class PageManager {
    private pageMap 		:Map<string, Page>;
    private componentMap	:Map<string, Function>;
    private onScreen		:Set<string>;

    constructor() {
        this.pageMap = new Map();
        this.componentMap = new Map();
        this.onScreen = new Set();
    }

    registerPage(name: string, page: Page) {
		if (this.pageMap.has(name)) return ;

        this.pageMap.set(name, page);
    }

	registerView(name: string, func: Function) {
		if (this.pageMap.has(name)) return ;

        this.componentMap.set(name, func);
    }

    setElement(name :string, displayFunction :Function): Page {
		if (this.pageMap.has(name)) return (this.pageMap.get(name)!);

		let page = new Page(name);
		page.setDisplay(displayFunction);
        this.pageMap.set(name, page);
        return (page);
    }

    get(name :string): Page | null{
        return (this.pageMap.has(name) ? this.pageMap.get(name)! :  null);
    }

    async load(name :string): Promise<boolean> {
        if (!this.pageMap.has(name) && !(await AppControl.fetchElement(name))) {
            console.log(`Could not load the page: ${name}`);
            return (false);
        }
		console.log(`loading ${name}`);
        let page = this.pageMap.get(name)!;
		document.body.appendChild(page.getHtml());
        this.onScreen.add(name);
        page.onDisplay();
		page.getDependencies().forEach(element => this.load(element));
		return (true);
    }

	async newLoad(name: string) {
		console.log(`new ${name}`);
		this.onScreen.forEach(name => document.querySelector(`[page="${name}"]`)?.remove());

        // if (!this.componentMap.has(name) && !(await AppControl.fetchElement(name))) {
		// 	console.log(`PageManager: The page ${name} does not exist`);
		// 	// this.urlLoad("home");
		// 	return ;
        // }
        this.onScreen.add(name);
		document.body.appendChild(this.componentMap.get(name)!());
		if (window.location.pathname !== name)
			history.pushState({name: name}, '', name);
	}

    async urlLoad(name :string) {
		console.log(`urload ${name}`);
		this.onScreen.forEach(page => this.unload(page));

        if (!this.pageMap.has(name) && !(await AppControl.fetchElement(name))) {
			console.log(`PageManager: The page ${name} does not exist`);
			// this.urlLoad("home");
			return ;
        }
		this.load(name);
		if (window.location.pathname !== name)
			history.pushState({name: name}, '', name);
	}

    unload(name :string) {
		let page = this.pageMap.get(name);
        if (!page) {
			if (name)
                console.log(`Could not unload the page: ${name}`);
			return ;
        }
		page.onRemove();
		document.querySelector(`[page="${name}"]`)?.remove();
        this.onScreen.delete(name);
    }

    forEach(callback: (arg0: Page, arg1: string, arg2: Map<string, Page>) => void) {
		this.pageMap.forEach((value, key, map) => {
			callback(value, key, map);
        });
    }
	
}
