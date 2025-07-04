import { BaseComponent } from "./BaseComponent";
type AnyBaseComponent = new (...args: any[]) => BaseComponent;


export class PageManager {
    private componentMap	:Map<string, AnyBaseComponent>;
	private currentPage: (BaseComponent | null)[];

    constructor() {
        this.componentMap = new Map();
		this.currentPage = [];
    }

    register(name: string, page: typeof BaseComponent) {
		if (this.componentMap.has(name)) return ;

        this.componentMap.set(name, page);
    }

	navigate(name: string) {
		console.log(`new ${name}`);
		this.currentPage.forEach(page => page?.remove());

        if (!this.componentMap.has(name)) {
			console.log(`PageManager: The page ${name} does not exist`);
			if (name != "/home") this.navigate("/home");
			return ;
        }
		this.load(name);
		// const newPage = new (this.componentMap.get(name) as any);
		// this.currentPage.push(newPage);
		// document.body.appendChild(newPage as Node);
		if (window.location.pathname !== name)
			history.pushState({name: name}, '', name);
	}

	load(name: string) {
		console.log(`load ${name}`);

        if (!this.componentMap.has(name)) {
			console.log(`PageManager: The page ${name} does not exist`);
			return ;
        }
		const newPage = new (this.componentMap.get(name) as any);
		this.currentPage.push(newPage);
		document.body.appendChild(newPage as Node);
	}
}

    // get(name :string): Page | null{
    //     return (this.componentMap.has(name) ? this.componentMap.get(name)! :  null);
    // }

    // forEach(callback: (arg0: Page, arg1: string, arg2: Map<string, Page>) => void) {
	// 	this.componentMap.forEach((value, key, map) => {
	// 		callback(value, key, map);
    //     });
    // }

// registerView(name: string, func: typeof BaseComponent) {
// 	if (this.pageMap.has(name)) return ;

// 	this.componentMap.set(name, func);
// }

    // setElement(name :string, displayFunction :Function): Page {
	// 	if (this.pageMap.has(name)) return (this.pageMap.get(name)!);

	// 	let page = new Page(name);
	// 	page.setDisplay(displayFunction);
    //     this.pageMap.set(name, page);
    //     return (page);
    // }

    // async load(name :string): Promise<boolean> {
    //     if (!this.pageMap.has(name) && !(await AppControl.fetchElement(name))) {
    //         console.log(`Could not load the page: ${name}`);
    //         return (false);
    //     }
	// 	console.log(`loading ${name}`);
    //     let page = this.pageMap.get(name)!;
	// 	document.body.appendChild(page.getHtml());
    //     this.onScreen.add(name);
    //     page.onDisplay();
	// 	page.getDependencies().forEach(element => this.load(element));
	// 	return (true);
    // }

    // async navigate(name :string) {
	// 	console.log(`urload ${name}`);
	// 	this.onScreen.forEach(page => this.unload(page));

    //     if (!this.pageMap.has(name) && !(await AppControl.fetchElement(name))) {
	// 		console.log(`PageManager: The page ${name} does not exist`);
	// 		// this.navigate("home");
	// 		return ;
    //     }
	// 	this.load(name);
	// 	if (window.location.pathname !== name)
	// 		history.pushState({name: name}, '', name);
	// }

    // unload(name :string) {
	// 	let page = this.pageMap.get(name);
    //     if (!page) {
	// 		if (name)
    //             console.log(`Could not unload the page: ${name}`);
	// 		return ;
    //     }
	// 	page.onRemove();
	// 	document.querySelector(`[page="${name}"]`)?.remove();
    //     this.onScreen.delete(name);
    // }
