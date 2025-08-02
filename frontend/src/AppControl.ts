import { jwtDecode } from "jwt-decode";
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

	static getValidDecodedToken() {
		const token = localStorage.getItem("authToken");
		if (!token) return (null);

		try {
			const decoded = jwtDecode(token);
			const now = Math.floor(Date.now() / 1000);
			if (decoded.exp! < now) {
				localStorage.removeItem("authToken");
				return (null);
			}
			return (decoded);
		} catch {
			localStorage.removeItem("authToken");
			return (null);
		}
	}
}
