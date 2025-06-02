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
			this.bindElements();
			this.onInit();
		} else {
			fetch(name)
				.then(res => res.text())
				.then(html => {
					this.innerHTML = html;
					templates.set(name, html);
					this.bindElements();
					this.onInit();
				});
		}
	}

	onInit() {}

	getElementById(id: string) {
		return (this.querySelector(`#${id}`) as HTMLElement);
	}

    addEvents(...events :EventInfo[]) {
		if (!events.length) return ;

		this.eventInfo.push(...events);
        events.forEach((event) => {
			this.getElementById(event.id)?.addEventListener(event.type, event.handler)
		});
    }

	private bindElements() {
		const elements = this.querySelectorAll<HTMLElement>('[id]');
		elements.forEach(el => {
			// console.log(`Binding element with id: ${el.id}`);
			if (el.id) {
				(this as any)[el.id] = el;
			}
		});
	}

	onDestroy() {

	}
	
}

customElements.define("base-component", BaseComponent);

// let element :HTMLElement | null;
// element = this.getElementById(event.id);
// if (!element) return ;
// element.addEventListener(event.type, event.handler);