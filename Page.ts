type EventTuple = [string, string, Function]; // or (ev: Event) => void
type EventInfo = {
  id: string;
  type: string;
  handler: EventListener;
};

export class Page {
    #name				:string;
    #displayFunction	:Function;
    #eventInfo			:EventInfo[];
	#dependencies		:string[];
	#htmlOriginal		:HTMLDivElement;
	#htmlCopy			:HTMLDivElement;
    #onDisplay			:string;
	#script				:Element;

    constructor(name :string, displayFunc :Function) {
        this.#displayFunction = displayFunc;
        this.#name = name;
		this.#dependencies = [];
		this.#eventInfo = [];
        this.#onDisplay = "none";
    }

    addEvents(...events :EventInfo[]) {
		this.#eventInfo.push(...events);
		return (this);
    }

    setScript(script :Element) {
        this.#script = script;
		return (this);
    }

    setHtml(tag :HTMLDivElement) {
        this.#htmlOriginal = tag;
		this.#htmlCopy = this.#htmlOriginal.cloneNode(true) as HTMLDivElement;
		return (this);
    }

	getName() {
        return (this.#name);
    }

    #eventListeners(action :string) {
        if (!this.#eventInfo.length)
            return ;
        let element :HTMLElement | null;
        this.#eventInfo.forEach(event => {
            element = document.getElementById(event.id);
            if (!element)
				return ;
            if (action == "block")
                element.addEventListener(event.type, event.handler);
            else
                element.removeEventListener(event.type, event.handler);
        });
    }

    setDependencies(...elements :string[]) {
        this.#dependencies = elements;
        return (this);
    }

    getDependencies() {
        return (this.#dependencies);
    }

	getHtml() {
        return (this.#htmlCopy);
    }

    onDisplay() {
        this.#onDisplay = "block";
        this.#eventListeners("block");
        this.#displayFunction("block");
    }

	onRemove() {
		this.#htmlCopy = this.#htmlOriginal.cloneNode(true) as HTMLDivElement;
        this.#onDisplay = "none";
        this.#eventListeners("none");
        this.#displayFunction("none");
    }

    isOnScreen() {
        return (this.#onDisplay !== "none");
    }

    destructor() {
        this.onRemove();
    }
}
