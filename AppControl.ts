import { views } from "./main";
import { Page } from "./Page";

export class AppControl {
	constructor() {}
	
	static bodyDisplay(tagName :string) {
		document.querySelectorAll<HTMLElement>('body > *').forEach(element => {
			element.style.display = 'none';
		});
		document.getElementById(tagName)!.style.display = 'block';
	}

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

	// LOAD HTML AND .TS SEPARETELY

    static async fetchElement(name :string): Promise<Boolean> {
        try {
			let	page :Page;
			let newdiv :Element;
			name = "/" + name.replace(/^\/+/, "");

			const [jsScript, html] = await Promise.all([
				import(`/pages${name}.js`),
				fetch(`/pages${name}.html`).then(response => {
					if (!response.ok) throw new Error(`Failed to fetch HTML for ${name}`);
					return (response.text());
				})
			]);

			newdiv = document.createElement('div');
			newdiv.innerHTML = html;
			newdiv.setAttribute("page", name);
			page = views.get(name)!; 
			page.setHtml(newdiv)
				.setScript(jsScript);

			return (true);
        }
		catch (error) {
			console.error('Error:', error);
            views.urlLoad("/home");
            return (false);
        }
    }
}
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
