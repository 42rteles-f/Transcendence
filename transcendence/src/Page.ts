type EventTuple = [string, string, Function]; // or (ev: Event) => void
type EventInfo = {
  id: string;
  type: string;
  handler: EventListener;
};

type PageSet = {
	pageName: string;
	displayFunction?: Function;
	events?: EventInfo[];
	dependencies? :string[];
	htmlPath: string;
};

export class Page {
    private name				:string;
    private displayFunction		:Function;
    private eventInfo			:EventInfo[];
	private dependencies		:string[];
	private htmlPath			:string;
	private htmlOriginal		:HTMLDivElement;
	private htmlCopy			:HTMLDivElement;
    private onScreen			:string;

    constructor(name: string) {
        this.displayFunction = () => {};
        this.name = name;
		this.dependencies = [];
		this.eventInfo = [];
        this.onScreen = "none";
		this.htmlPath = `/pages/${name}.html`;
		this.htmlOriginal = document.createElement("div");
		this.htmlOriginal.setAttribute("page", this.name);
		this.htmlCopy = this.htmlOriginal.cloneNode(true) as HTMLDivElement;
		this.setHtmlFrom();
	}

    addEvents(...events :EventInfo[]) {
		if (!events.length) return (this);

		this.eventInfo.push(...events);
		return (this);
    }

    setDisplay(func :Function) {
        this.displayFunction = func;
		return (this);
    }

    setHtmlFrom(path?: string) {
		fetch(path ? path : this.htmlPath)
			.then(response => response.text())
			.then((html) => {
				this.htmlOriginal.innerHTML = html;
				this.htmlCopy.innerHTML = html;
		});
		return (this);
    }

    setHtml(tag :HTMLDivElement) {
		tag.setAttribute("page", this.name);
        this.htmlOriginal = tag;
		this.htmlCopy.innerHTML = this.htmlOriginal.innerHTML;
		return (this);
    }

	getName() {
        return (this.name);
    }

    private eventListeners(action :string) {
        if (!this.eventInfo.length)
            return ;
        let element :HTMLElement | null;
        this.eventInfo.forEach(event => {
            element = document.getElementById(event.id);
            if (!element) {
				return ;
			}
            if (action == "block")
                element.addEventListener(event.type, event.handler);
            else
                element.removeEventListener(event.type, event.handler);
        });
    }

    includePages(...elements :string[]) {
        this.dependencies = elements;
        return (this);
    }

    getDependencies() {
        return (this.dependencies);
    }

	getHtml() {
        return (this.htmlCopy);
    }

    onDisplay() {
        this.onScreen = "block";
        this.eventListeners("block");
        this.displayFunction("block");
    }

	onRemove() {
		this.htmlCopy = this.htmlOriginal!.cloneNode(true) as HTMLDivElement;
        this.onScreen = "none";
        this.eventListeners("none");
        this.displayFunction("none");
    }

    isOnScreen() {
        return (this.onScreen !== "none");
    }

    destructor() {
        this.onRemove();
    }
}
