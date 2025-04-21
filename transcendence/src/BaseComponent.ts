const templates = new Map<string, string>();

type EventInfo = {
	id: string;
	type: string;
	handler: EventListener;
};

export class BaseComponent extends HTMLElement {
    private eventInfo			:EventInfo[];

	constructor(name: string) {
		super();
		this.eventInfo = [];

		if (templates.has(name)) {
			this.innerHTML = templates.get(name)!;
			this.onInit();
		} else {
			fetch(name)
				.then(res => res.text())
				.then(html => {
					this.innerHTML = html;
					templates.set(name, html);
					this.onInit();
				});
		}
	}

	onInit() {}

	getElementById(id: string) {
		return (this.querySelector(`#${id}`) as HTMLElement);
	}

    addEvents(...events :EventInfo[]) {
		if (!events.length) return (this);

		this.eventInfo.push(...events);
        let element :HTMLElement | null;
        this.eventInfo.forEach(event => {
            element = this.getElementById(event.id);
            if (!element) {
				console.log("not element");
				return ;
			}
			element.addEventListener(event.type, event.handler);
        });
    }
}

customElements.define("base-component", BaseComponent);