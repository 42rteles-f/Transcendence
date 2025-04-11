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

    static async fetchApp(name :string) {
        try {
            name = "/" + name.replace(/^\/+/, "");
            // let find = "api" + name;
            let find = window.hostUrl + "/spa" + name;
            const response = await fetch(find);

            if (!response.ok)
                throw new Error('Network response was not ok: ' + response.statusText);
            // console.log("appcontrol response =", response);
            const appHtml = await response.text();
            const element = document.querySelector(`[page="${name}"]`);
            
            let newdiv;
            if (element) {
                newdiv = element;
            } else {
                newdiv = document.createElement('div');
                newdiv.innerHTML = appHtml;
                newdiv.setAttribute("page", name);
            }
            // document.body.innerHTML = appHtml;
            // const fetched = views.get(name);
            // if (fetched)
            // await views.waitFetch(name);
            views.get(name).setHtml(newdiv);
            return (views.get(name));
        } catch (error) {
            console.error('Error:', error);
            views.urlLoad("/home");
            return (false);
        }
    }

}

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
