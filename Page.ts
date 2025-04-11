export class Page {
    #displayFunction :Function;
    #eventInfo;
    #name :string;
    #onDisplay :string;
	#html: Element;
	#bindings: any;
	#script: Element;

    constructor(name :string, displayFunc :Function, events :[string, string, Function]) {
        this.#displayFunction = displayFunc;
        this.#eventInfo = [];
        this.#name = name;
        this.#onDisplay = "none";
        if (events) this.setEvents(events);
    }

    setEvents(...events) {
        events.forEach(event => {
            if (!Array.isArray(event) || event.length !== 3) {
                console.log('Invalid event format. Expected [string, string, function]');
                return ;
            }
            this.#eventInfo.push({
                id: event[0],
                type: event[1],
                handler: event[2]
            });
        });
    }

    setScript(script :Element) {
        this.#script = script;
		return (this);
    }

    setHtml(tag :Element) {
        this.#html = tag;
		return (this);
    }

	getName() {
        return (this.#name);
    }

    #eventListeners(on) {
        if (!this.#eventInfo.length)
            return ;
        let element;
        this.#eventInfo.forEach(event => {
            element = document.getElementById(event.id);
            if (!element) return ;
            if (on)
                element.addEventListener(event.type, event.handler);
            else
                element.removeEventListener(event.type, event.handler);
        });
    }

    setChilds(elements) {
        this.#bindings = elements;
        return (this);
    }

    getFamilyTree() {
        return (this.#bindings);
    }

	getHtml() {
        return (this.#html);
    }

    display(state) {
        this.#onDisplay = state;
        this.#eventListeners(state === "none" ? false : true);
        this.#displayFunction(state);
    }

    isOnScreen() {
        return (this.#onDisplay !== "none");
    }

    destructor() {
        this.display("none");
    }
}
