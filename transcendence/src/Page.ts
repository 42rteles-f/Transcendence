type EventTuple = [string, string, Function]; // or (ev: Event) => void
type EventInfo = {
  id: string;
  type: string;
  handler: EventListener;
};

export class Page {
    private name				:string;
    private displayFunction		:Function;
    private eventInfo			:EventInfo[];
	private dependencies		:string[];
	private htmlOriginal		:HTMLDivElement;
	private htmlCopy			:HTMLDivElement;
    private onScreen			:string;
	private script				:Element;

    constructor(name :string, displayFunc :Function) {
        this.displayFunction = displayFunc;
        this.name = name;
		this.dependencies = [];
		this.eventInfo = [];
        this.onScreen = "none";
		this.htmlOriginal = document.createElement("div");
		this.htmlCopy = document.createElement("div");
		this.script = document.createElement("div");
	}

    addEvents(...events :EventInfo[]) {
		if (!events.length) return (this);

		this.eventInfo.push(...events);
		return (this);
    }

    setScript(script :Element) {
        this.script = script;
		return (this);
    }

    setHtml(tag :HTMLDivElement) {
		tag.setAttribute("page", this.name);
		if (!tag.style.order)
			tag.setAttribute("style", "order: 999;");
        this.htmlOriginal = tag;
		this.htmlCopy = this.htmlOriginal.cloneNode(true) as HTMLDivElement;
		return (this);
    }

	getName() {
        return (this.name);
    }

    private eventListeners(action :string) {
		console.log("eventListeners");
        if (!this.eventInfo.length)
            return ;
		console.log("eventListeners after return");
        let element :HTMLElement | null;
        this.eventInfo.forEach(event => {
            element = document.getElementById(event.id);
            if (!element) {
				console.log("not element");	
				return ;
			}
			console.log("element");	
            if (action == "block")
                element.addEventListener(event.type, event.handler);
            else
                element.removeEventListener(event.type, event.handler);
        });
    }

    setDependencies(...elements :string[]) {
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
