import { Page } from "./Page";
import { AppControl } from "./AppControl";
// import { warnIf } from "../main.js";

type EventInfo = {
	id: string;
	type: string;
	handler: EventListener;
};

type PageList = {
	pageName: string;
	displayFunction: Function;
	events: EventInfo[];
	dependencies :string[];
};

export class PageManager {
    private pageMap :Map<string, Page>;
    private onScreen :Set<string>;

    constructor(current: string) {
        this.pageMap = new Map();
        this.onScreen = new Set();
    }

    setElementObj(info :PageList): Page {
		if (this.pageMap.get(info.pageName)) return (this.pageMap.get(info.pageName)!);

		let page = new Page(info.pageName, info.displayFunction);
		page.addEvents(...info.events);
		page.setDependencies(...info.dependencies);
        this.pageMap.set(info.pageName, page);
        return (page);
    }

    setElement(name :string, displayFunction :Function): Page {
		if (this.pageMap.get(name)) return (this.pageMap.get(name)!);

		let page = new Page(name, displayFunction);
        this.pageMap.set(name, page);
        return (page);
    }

	views() {
		return (this.pageMap);
	}

    get(name :string): Page | null{
        return (this.pageMap.get(name) ? this.pageMap.get(name)! :  null);
    }

    async load(name :string): Promise<boolean> {
        if (!this.pageMap.get(name) && !(await AppControl.fetchElement(name))) {
            console.log(`Could not load the page: ${name}`);
            return (false);
        }
        let page = this.pageMap.get(name)!;
		document.body.appendChild(page.getHtml());
        this.onScreen.add(name);
        page.onDisplay();
		page.getDependencies().forEach(element => this.load(element));
		return (true);
    }

    async urlLoad(name :string) {
		console.log(`urload ${name}`);
		this.onScreen.forEach(page => this.unload(page));

        if (!this.pageMap.get(name) && !(await AppControl.fetchElement(name))) {
			console.log(`PageManager: The page ${name} does not exist`);
			// this.urlLoad("home");
			return ;
        }
		this.load(name);
		if (window.location.pathname !== name)
			history.pushState({name: name}, '', name);
		this.currentPage = window.location.pathname;
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
// async highlight(name :string) {
// 	this.onScreen.forEach(page => {
// 		page.onRemove();
// 	});
// 	this.onScreen.clear();

// 	await AppControl.fetchElement(name);
// 	if (this.pageMap.get(name)) {
// 		console.log("passed fetch app");
// 		this.load(name);
// 	}
// 	else {
// 		console.log("page " + this.pageMap.get(name));
// 		// this.load("/");
// 		console.log(`The page ${name} does not exist`);
// 	}
// 	if (window.location.pathname !== name)
// 		history.pushState({name: name}, '', name);
// }

// setCurrent(page) {
    //     history.pushState({page: page}, '', page);
    //     this.currentPage = window.location.pathname;
    // }

    // clearScreenOnLoad(caller) {
    //     if (!this.pageMap.get(caller).isOnScreen())
    //         return ;
    //     this.onScreen.forEach(page => {
    //         if (caller === page.name) return ;
    //         page.display(false);
    //     });
    //     this.onScreen.clear();
    // }