const templates = new Map<string, string>();

type EventInfo = {
	id: string;
	type: string;
	handler: EventListener;
};

export class BaseComponent extends HTMLElement {
    private eventInfo	:EventInfo[];
	public name			:string;

	constructor(name: string) {
		super();
		this.eventInfo = [];
		this.name = name;
	}

	onInit() {}

	async connectedCallback() {
		let html: string;

		if (templates.has(this.name)) {
			html = templates.get(this.name)!;
		} else {
			html = await fetch(this.name).then(res => res.text());
			templates.set(this.name, html);
		}

		this.innerHTML = html;
		this.bindElements();
		this.onInit();
	}

	disconnectedCallback() {
		this.onDestroy();
	}

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
		const elements = this.querySelectorAll<HTMLElement>('[data-ref]');
		elements.forEach(el => {
			if (el.dataset?.ref) {
				(this as any)[el.dataset.ref] = el;
			}	
		});
	}

	onDestroy(): void {}
	
}

customElements.define("base-component", BaseComponent);

// let element :HTMLElement | null;
// element = this.getElementById(event.id);
// if (!element) return ;
// element.addEventListener(event.type, event.handler);