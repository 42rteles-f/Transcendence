import { jwtDecode } from "jwt-decode";
import { Pointer } from "../PageManager";
import { routes } from "../routes";
import Socket from "../Socket";

class Api {
    private static apiUrl: string = import.meta.env.VITE_API_URL;
    private static userApiUrl: string = import.meta.env.VITE_USER_API_URL;
    private static token: Pointer<string> = null;

    static async errorCheck(response: Response) {
		let error = null;
        if (response.status === 401) {
            localStorage.removeItem("authToken");
			Socket.disconnect();
            routes.navigate("/login");
			return ;
		}
         else if (!response.ok) {
            error = new Error(await response.json().then(data => data.message || "Handled Unknown error"));
			(error as any).status = response.status;
			throw error;
		}
    }

    static async makeRequest(apiPath: string, method: "GET" | "POST", body?: string, params?: URLSearchParams | "") {
        let fullPath = `${this.apiUrl}${apiPath}`;
        if (params && typeof params === "object" && params.toString())
            fullPath += '?' + params.toString();
		console.log(`Making ${method} request to: ${fullPath}`);
        const response = await fetch(fullPath, {
            method: method,
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${this.token || localStorage.getItem("authToken")}`
            },
            body: body
        });
        await this.errorCheck(response);
        return (response.json());
    }

    static async login(username: string, password: string) {
        const body = JSON.stringify({ username, password });
        const response = await this.makeRequest("user/login", "POST", body);
        this.token = response.message;
        localStorage.setItem("authToken", this.token!);
        return response;
    }

    static async register(username: string, password: string) {
        const body = JSON.stringify({ username, password });
        const response = await this.makeRequest("user/register", "POST", body);
        this.token = response.message;
        localStorage.setItem("authToken", this.token!);
        return response;
    }

    static async getProfile(id: string | number | null): Promise<any> {
		const data = await this.makeRequest(`user/profile/${id}`, "GET");
		return data.message;
    }

    static async getMatchHistory(id: string | number, page: number = 1, pageSize: number = 10): Promise<any> {
        const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
		const data = await this.makeRequest(`user/match-history/${id}`, "GET", undefined, params);
        return data.message;
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
        await this.errorCheck(response);
        const data = await response.json();
        return data.message;
    }

    static async friendRequest(friendId: number, status: 'pending' | 'accepted' | 'rejected' | 'removed' | 'no friendship'): Promise<any> {
        const body = JSON.stringify({ status });
		const data = await this.makeRequest(`user/friend-request/${friendId}`, "POST", body);
        return data.message;
    }

    static async getFriendRequest(friendId: number | string | null): Promise<any> {
		const data = await this.makeRequest(`user/friend-request/${friendId}`, "GET");
        return data.message;
    }

    static async getAllFriendRequests(friendId: number | string | null): Promise<any> {
		const data = await this.makeRequest(`user/all-friend-requests/${friendId}`, "GET");
		return data.message;
    }

    static async findUsers(userId: number | string | null): Promise<any> {
		const data = await this.makeRequest(`user/not-friends-list/${userId}`, "GET");
		return data.message;
    }

    static async getAllFriends(userId: number | string | null): Promise<any> {
		const data = await this.makeRequest(`user/friends-list/${userId}`, "GET");
		return data.message;
    }

    static async getAllTournaments(page: number = 1, pageSize: number = 5): Promise<any> {
        const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
		const data = await this.makeRequest(`tournament/all`, "GET", undefined, params);
		return data.message;
    }

    static async createTournament(name: string, numberOfPlayers: number, displayName: string): Promise<{ id: number }> {
        const body = JSON.stringify({ name, numberOfPlayers, displayName });
		const data = await this.makeRequest(`tournament/create`, "POST", body);
		return data.message;
    }

    static async getTournament(tournamentId: number): Promise<any> {
		const data = await this.makeRequest(`tournament/${tournamentId}`, "GET");
		return data.message;
    }

    static async cancelTournament(tournamentId: number): Promise<any> {
		const data = await this.makeRequest(`tournament/cancel/${tournamentId}`, "POST");
		return data.message;
    }

    static async joinTournament(tournamentId: number, displayName: string): Promise<any> {
        const body = JSON.stringify({ displayName });
		const data = await this.makeRequest(`tournament/join/${tournamentId}`, "POST", body);
		return data.message;
    }

    static async unsubscribeTournament(tournamentId: number): Promise<any> {
		const data = await this.makeRequest(`tournament/unsubscribe/${tournamentId}`, "POST");
		return data.message;
    }

    static async startTournament(tournamentId: number): Promise<any> {
		const body = JSON.stringify({ start: true });
		const data = await this.makeRequest(`tournament/start/${tournamentId}`, "POST", body);
		return data.message;
    }

    static async logout(): Promise<void> {
        const token = localStorage.getItem("authToken");
		Socket.disconnect();
        if (!token) {
            console.error('No token found. Cannot logout.');
            return;
        }
        localStorage.removeItem("authToken");
    }
}

export default Api;
