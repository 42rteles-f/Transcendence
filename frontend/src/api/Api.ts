import { jwtDecode } from "jwt-decode";
import { Pointer } from "../PageManager";
import { routes } from "../routes";

class Api {
    private static apiUrl: string = "http://192.168.1.8:3000/";
    private static userApiUrl: string = "http://192.168.1.8:3000/user/";
    private static token: Pointer<string> = null;

    static errorCheck(response: Response) {
        if (response.status === 401) {
            localStorage.removeItem("authToken");
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
        let fullPath = `${this.apiUrl}${apiPath}`;
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
        console.log(jwtDecode(this.token!));
        localStorage.setItem("authToken", this.token!);
        return response;
    }

    static async register(username: string, nickname: string, password: string) {
        const body = JSON.stringify({ username, nickname, password });
        const response = await this.makeRequest("user/register", "POST", body);
        this.token = response.message;
        localStorage.setItem("authToken", this.token!);
        return response;
    }

    static async getProfile(id: string | number | null): Promise<any> {
        return this.makeRequest(`user/profile/${id}`, "GET");
    }

    static async getMatchHistory(id: string | number, page: number = 1, pageSize: number = 10): Promise<any> {
        const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
        return this.makeRequest(`user/match-history/${id}`, "GET", undefined, params);
    }

    static async updateProfile(form: FormData): Promise<any> {
        const token = localStorage.getItem("authToken");
        const response = await fetch(`${this.userApiUrl}update`, {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: form
        });
        this.errorCheck(response);
        const data = await response.json();
        return data.message;
    }

    static async friendRequest(friendId: number, status: 'pending' | 'accepted' | 'rejected' | 'removed' | 'no friendship'): Promise<any> {
        const body = JSON.stringify({ status });
        return this.makeRequest(`user/friend-request/${friendId}`, "POST", body);
    }

    static async getFriendRequest(friendId: number | string | null): Promise<any> {
        return this.makeRequest(`user/friend-request/${friendId}`, "GET");
    }

    static async getAllFriendRequests(friendId: number | string | null): Promise<any> {
        return this.makeRequest(`user/all-friend-requests/${friendId}`, "GET");
    }

    static async findUsers(userId: number | string | null): Promise<any> {
        return this.makeRequest(`user/not-friends-list/${userId}`, "GET");
    }

    static async getAllFriends(userId: number | string | null): Promise<any> {
        return this.makeRequest(`user/friends-list/${userId}`, "GET");
    }

    static async getAllTournaments(page: number = 1, pageSize: number = 5): Promise<any> {
        const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
        return this.makeRequest(`tournament/all`, "GET", undefined, params);
    }

    static async createTournament(name: string, maxPlayers: number, displayName: string): Promise<{ tournamentId: number }> {
        const body = JSON.stringify({ name, maxPlayers, displayName });
        return this.makeRequest(`tournament/create`, "POST", body);
    }

    static async getTournament(tournamentId: number): Promise<any> {
        return this.makeRequest(`tournament/${tournamentId}`, "GET");
    }

    static async cancelTournament(tournamentId: number): Promise<any> {
        return this.makeRequest(`tournament/cancel/${tournamentId}`, "POST");
    }

    static async joinTournament(tournamentId: number, displayName: string): Promise<any> {
        const body = JSON.stringify({ displayName });
        return this.makeRequest(`tournament/join/${tournamentId}`, "POST", body);
    }

    static async unsubscribeTournament(tournamentId: number): Promise<any> {
        return this.makeRequest(`tournament/unsubscribe/${tournamentId}`, "POST");
    }

    static async startTournament(tournamentId: number): Promise<any> {
        return this.makeRequest(`tournament/start/${tournamentId}`, "POST");
    }

    static async logout(): Promise<void> {
        localStorage.removeItem("authToken");
        console.log('Logged out successfully');
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