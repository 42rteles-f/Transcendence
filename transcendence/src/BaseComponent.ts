const templates = new Map<string, string>();

export class BaseComponent extends HTMLElement {
	constructor(template: string) {
		super();
		if (templates.has(template)) {
			this.innerHTML = templates.get(template)!;
			this.onInit();
		} else {
			fetch(template)
				.then(res => res.text())
				.then(html => {
					this.innerHTML = html;
					templates.set(template, html);
					this.onInit();
				});
		}
	}

	onInit() {}
}

customElements.define("base-component", BaseComponent);