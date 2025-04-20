import { views } from "./views"
import { Page } from "./Page"

export class AppControl {
	constructor() {}

    static getCookie(name :string) {
        let cookieValue :string = "";
    
        if (document.cookie && document.cookie !== '')
        {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++)
            {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return (cookieValue);
    }

    static async fetchElement(name :string): Promise<Boolean> {
		if (views.get(name))
			return (true);
        try {
			name = "/" + name.replace(/^\/+/, "");
			await import(`/pages${name}.ts`);

			const page :Page = views.get(name)!;
			await Promise.all(
				page.getDependencies().map(dep => this.fetchElement(dep))
			);
			return (true);
        }

		catch (error) {
			console.error('Error:', error);
            return (false);
        }
    }
}
