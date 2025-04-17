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
			const [jsScript, html] = await Promise.all([
				import(`/pages${name}.ts`),
				fetch(`/pages${name}.html`).then(response => {
					if (!response.ok) throw new Error(`Failed to fetch HTML for ${name}`);
					return (response.text());
				})
			]);
			const page :Page = views.get(name)!;
			const newdiv :HTMLDivElement = document.createElement('div');
			newdiv.innerHTML = html;
			newdiv.setAttribute("page", name);
			page.setHtml(newdiv).setScript(jsScript);
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

	// static bodyDisplay(tagName :string) {
	// 	document.querySelectorAll<HTMLElement>('body > *').forEach(element => {
	// 		element.style.display = 'none';
	// 	});
	// 	document.getElementById(tagName)!.style.display = 'block';
	// }

// const element = document.querySelector(`[page="${name}"]`);
// if (element) {
// 	newdiv = element;
// } else {
// }

// static async #executeScript(doc) {
//     const scripts = doc.querySelectorAll('script');
//     const scriptPromises = Array.from(scripts).map(script => {
//         return new Promise((resolve, reject) => {
//             const newScript = document.createElement('script');
//             newScript.src = script.src;
//             newScript.type = script.type;
//             newScript.onload = resolve;
//             newScript.onerror = reject;
//             document.head.appendChild(newScript);
//             script.parentNode.removeChild(script);
//         });
//     });
//     return (await Promise.all(scriptPromises));
// static register() {
//     fetch("http://127.0.0.1:8000/api/register/", {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//             'X-CSRFToken': this.getCookie('csrftoken')
//         },
//         body: JSON.stringify({
//             username: document.getElementById('username').value,
//             password: document.getElementById('password').value
//         })
//     })
//         .then(response => response.json())
//         .then(data => {
//             console.log(data.message);
//         })
//         .catch(error => {
//             console.error('Error:', error);
//         });
// };
