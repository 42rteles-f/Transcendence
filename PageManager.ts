import { Page } from "./Page.js";
import { AppControl } from "./AppControl.js";
import { warnIf } from "./main.js";

export class PageManager {
    #pageMap :Map<string, Page>;
    #onScreen :Set<Page>;
    #currentPage :string;

    constructor(current) {
        this.#pageMap = new Map();
        this.#onScreen = new Set();
        this.#currentPage = "current";
    }

    setElement(
		name :string,
		displayFunction :Function,
		events :[string, string, (ev: Event) => void]
	): Page | undefined {
        if (
			warnIf(typeof(name) !== 'string', `Invalid page name: ${name}`) ||
			warnIf(typeof(displayFunction) !== 'function', `The value set for ${name} is not a function`)
		)
            return ;

		let page = new Page(name, displayFunction, events);
        this.#pageMap.set(name, page);
        return (page);
    }

    get(name :string) {
        return (this.#pageMap.get(name));
    }

    async load(name :string) {
        if (!this.#pageMap.get(name) && !(await AppControl.fetchApp(name))) {
            console.log(`Could not load the page: ${name}`);
            return ;
        }
        let page = this.#pageMap.get(name)!;
        page.display("block");
        this.#onScreen.add(page);
        this.#currentPage = window.location.pathname;
    }

    async highlight(name :string) {
        this.#onScreen.forEach(page => {
            page.display("none");
        });
        this.#onScreen.clear();

        await AppControl.fetchElement(name);
        if (this.#pageMap.get(name)) {
            console.log("passed fetch app");
            this.load(name);
        }
        else {
            console.log("page " + this.#pageMap.get(name));
            // this.load("/");
            console.log(`The page ${name} does not exist`);
        }
        if (window.location.pathname !== name)
            history.pushState({name: name}, '', name);
    }

    async urlLoad(name :string) {
        this.#onScreen.forEach(page => {
            page.display("none");
        });
        this.#onScreen.clear();
    
        if (this.#pageMap.get(name) || (await AppControl.fetchApp(name))) {
            console.log("passed fetch app");
            this.load(name);
        }
        else {
            console.log("page " + this.#pageMap.get(name));
            // this.load("/");
            console.log(`The page ${name} does not exist`);
        }
        if (window.location.pathname !== name)
            history.pushState({name: name}, '', name);
    }

    unload(name :string) {
        let page = this.#pageMap.get(name);

        if (!page) {
            if (name)
                console.log(`Could not unload the page: ${name}`);
            return ;
        }
        page.display("none");
        this.#onScreen.delete(page);
    }

    forEach(callback) {
        this.#pageMap.forEach((value, key, map) => {
            callback(value, key, map);
        });
    }
}

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