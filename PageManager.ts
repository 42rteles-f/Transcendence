import { Page } from "./Page.js";
import { AppControl } from "./AppControl.ts";
import { warnIf } from "./main.js";

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
    #pageMap :Map<string, Page>;
    #onScreen :Set<string>;
    #currentPage :string;

    constructor(current) {
        this.#pageMap = new Map();
        this.#onScreen = new Set();
        this.#currentPage = "current";
    }

    setElementObj(info :PageList): Page{
		let page = new Page(info.pageName, info.displayFunction);
		page.addEvents(...info.events);
		page.setDependencies(...info.dependencies);
        this.#pageMap.set(info.pageName, page);
        return (page);
    }

// events :[string, string, Function]
    setElement(name :string, displayFunction :Function): Page {
		let page = new Page(name, displayFunction);
        this.#pageMap.set(name, page);
        return (page);
    }

    get(name :string): Page | null{
        return (this.#pageMap.get(name) ? this.#pageMap.get(name)! :  null);
    }

    async load(name :string): Promise<boolean> {
        if (!this.#pageMap.get(name) && !(await AppControl.fetchElement(name))) {
            console.log(`Could not load the page: ${name}`);
            return (false);
        }
        let page = this.#pageMap.get(name)!;
		document.body.appendChild(page.getHtml());
        page.onDisplay();
        this.#onScreen.add(name);
		page.getDependencies().forEach(element => this.load(element));
		return (true);
    }

    async urlLoad(name :string) {
		this.#onScreen.forEach(page => {
			this.unload(page)
        });

        if (!this.#pageMap.get(name) && !(await AppControl.fetchElement(name))) {
			console.log(`The page ${name} does not exist`);
			this.urlLoad("home");
			return ;
        }
		console.log("passed fetch app");
		this.load(name);
		history.pushState({name: name}, '', name);
		this.#currentPage = window.location.pathname;
	}

    unload(name :string) {
		let page = this.#pageMap.get(name);
        if (!page) {
			if (name)
                console.log(`Could not unload the page: ${name}`);
			return ;
        }
		document.querySelector(`[page="${name}"]`)?.remove();
		page.onRemove();
        this.#onScreen.delete(name);
    }

    forEach(callback) {
		this.#pageMap.forEach((value, key, map) => {
			callback(value, key, map);
        });
    }
	
}
// async highlight(name :string) {
// 	this.#onScreen.forEach(page => {
// 		page.onRemove();
// 	});
// 	this.#onScreen.clear();

// 	await AppControl.fetchElement(name);
// 	if (this.#pageMap.get(name)) {
// 		console.log("passed fetch app");
// 		this.load(name);
// 	}
// 	else {
// 		console.log("page " + this.#pageMap.get(name));
// 		// this.load("/");
// 		console.log(`The page ${name} does not exist`);
// 	}
// 	if (window.location.pathname !== name)
// 		history.pushState({name: name}, '', name);
// }

// setCurrent(page) {
    //     history.pushState({page: page}, '', page);
    //     this.#currentPage = window.location.pathname;
    // }

    // clearScreenOnLoad(caller) {
    //     if (!this.#pageMap.get(caller).isOnScreen())
    //         return ;
    //     this.#onScreen.forEach(page => {
    //         if (caller === page.name) return ;
    //         page.display(false);
    //     });
    //     this.#onScreen.clear();
    // }