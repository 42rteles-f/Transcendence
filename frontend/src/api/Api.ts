import { Pointer } from "../PageManager";
import { routes } from "../routes";

class Api {
	private static apiUrl: string = import.meta.env.VITE_API_URL || "http://localhost:3000";
	private static token: Pointer<string> = null;

	static errorCheck(response: Response) {
		if (response.status === 401) {
			localStorage.removeItem("authToken");
			localStorage.removeItem("providerForm");
			routes.navigate("/login");
		} else if (response.status === 403) {
			const error = new Error('Forbidden');
			(error as any).status = response.status;
			throw error;
		} else if (response.status === 404) {
			const error = new Error('Not Found');
			(error as any).status = response.status;
			throw error;
		} else if (!response.ok) {
			const error = new Error('Server Error');
			(error as any).status = response.status;
			throw error;
		}
	}

	static async makeRequest(apiPath: string, method: "GET" | "POST", body?: string, params?: URLSearchParams | "") {
		let fullPath = `${this.apiUrl}/${apiPath}`;
		if (params && typeof params === "object" && params.toString())
			fullPath += '?' + params.toString();
		const response = await fetch(fullPath, {
			method: method,
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${this.token || localStorage.getItem("authToken")}`
			},
			body: body
		});
		this.errorCheck(response);
		return (response.json());
	}

	static async login(username: string, password: string) {
		const body = JSON.stringify({ username, password });
		const response = await this.makeRequest("user/login", "POST", body);
		this.token = response.message;
		localStorage.setItem("authToken", this.token!);
		return (response);
	}

}

export default Api;


	// static async postRequest(apiPath: string, body: string) {
	// 	const response = await fetch(`${this.apiUrl}/${apiPath}`, {
	// 		method: "POST",
	// 		headers: {
	// 			"Content-Type": "application/json",
	// 			"Authorization": `Bearer ${this.token || localStorage.getItem("authToken")}`
	// 		},
	// 		body: body,
	// 	});
	// 	this.errorCheck(response);
	// 	return (response.json());
	// }

	// static async getRequest(apiPath: string, params: URLSearchParams | "") {
	// 	const response = await fetch(`${this.apiUrl}/${apiPath}?${params.toString()}`, {
	// 		method: "GET",
	// 		headers: {
	// 			"Content-Type": "application/json",
	// 			"Authorization": `Bearer ${this.token || localStorage.getItem("authToken")}`
	// 		},
	// 	});
	// 	this.errorCheck(response);
	// 	return (response.json());
	// }